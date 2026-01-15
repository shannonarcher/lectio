import JSZip from 'jszip'

// Parse the container.xml to find the OPF file path
function parseContainer(containerXml) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(containerXml, 'application/xml')
  const rootfile = doc.querySelector('rootfile')
  return rootfile?.getAttribute('full-path') || null
}

// Parse the OPF file to get the spine order (reading order)
function parseOPF(opfContent, opfPath) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(opfContent, 'application/xml')

  // Get the base directory of the OPF file
  const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1)

  // Get manifest items (id -> href mapping)
  const manifest = {}
  doc.querySelectorAll('manifest item').forEach(item => {
    const id = item.getAttribute('id')
    const href = item.getAttribute('href')
    const mediaType = item.getAttribute('media-type')
    if (id && href) {
      manifest[id] = { href: opfDir + href, mediaType }
    }
  })

  // Get spine order
  const spine = []
  doc.querySelectorAll('spine itemref').forEach(itemref => {
    const idref = itemref.getAttribute('idref')
    if (idref && manifest[idref]) {
      spine.push(manifest[idref].href)
    }
  })

  // Get title from metadata
  const titleEl = doc.querySelector('metadata title, metadata dc\\:title')
  const title = titleEl?.textContent || 'Untitled'

  return { spine, title }
}

// Extract text from HTML content
function extractTextFromHTML(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'application/xhtml+xml')

  // Remove script and style elements
  doc.querySelectorAll('script, style').forEach(el => el.remove())

  // Get text content from body
  const body = doc.body || doc.documentElement
  return body?.textContent || ''
}

// Clean up extracted text
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')  // Collapse whitespace
    .replace(/\n\s*\n/g, '\n\n')  // Normalize paragraph breaks
    .trim()
}

export async function parseEPUB(file) {
  const zip = await JSZip.loadAsync(file)

  // Read container.xml to find OPF location
  const containerFile = zip.file('META-INF/container.xml')
  if (!containerFile) {
    throw new Error('Invalid EPUB: missing container.xml')
  }

  const containerXml = await containerFile.async('string')
  const opfPath = parseContainer(containerXml)

  if (!opfPath) {
    throw new Error('Invalid EPUB: cannot find OPF file')
  }

  // Read OPF file
  const opfFile = zip.file(opfPath)
  if (!opfFile) {
    throw new Error('Invalid EPUB: OPF file not found')
  }

  const opfContent = await opfFile.async('string')
  const { spine, title } = parseOPF(opfContent, opfPath)

  // Extract text from each spine item in order
  const textParts = []

  for (const href of spine) {
    const contentFile = zip.file(href)
    if (contentFile) {
      const html = await contentFile.async('string')
      const text = extractTextFromHTML(html)
      if (text.trim()) {
        textParts.push(text)
      }
    }
  }

  const fullText = cleanText(textParts.join('\n\n'))

  return {
    title,
    text: fullText
  }
}
