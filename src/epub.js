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

  return { spine, title, manifest }
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

// Try to extract a chapter title from HTML content
function extractChapterTitle(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'application/xhtml+xml')

  // Look for common chapter heading patterns
  const headingSelectors = ['h1', 'h2', '.chapter-title', '.title', '[class*="chapter"]']
  for (const selector of headingSelectors) {
    const el = doc.querySelector(selector)
    if (el?.textContent?.trim()) {
      const title = el.textContent.trim()
      // Skip if it's just a number or too long
      if (title.length > 0 && title.length < 100) {
        return title
      }
    }
  }
  return null
}

// Parse NCX file for table of contents
function parseNCX(ncxContent, opfDir) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(ncxContent, 'application/xml')

  const chapters = []
  doc.querySelectorAll('navPoint').forEach(navPoint => {
    const label = navPoint.querySelector('navLabel text')?.textContent?.trim()
    const src = navPoint.querySelector('content')?.getAttribute('src')
    if (label && src) {
      // Normalize the href
      const href = opfDir + src.split('#')[0]
      chapters.push({ title: label, href })
    }
  })
  return chapters
}

// Parse NAV file (EPUB3) for table of contents
function parseNAV(navContent, opfDir) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(navContent, 'application/xhtml+xml')

  const chapters = []
  const nav = doc.querySelector('nav[epub\\:type="toc"], nav[*|type="toc"], nav')
  if (nav) {
    nav.querySelectorAll('a').forEach(a => {
      const label = a.textContent?.trim()
      const src = a.getAttribute('href')
      if (label && src) {
        const href = opfDir + src.split('#')[0]
        chapters.push({ title: label, href })
      }
    })
  }
  return chapters
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
  const { spine, title, manifest } = parseOPF(opfContent, opfPath)
  const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1)

  // Try to find and parse table of contents
  let tocChapters = []

  // Look for NCX file (EPUB2)
  for (const [, item] of Object.entries(manifest)) {
    if (item.mediaType === 'application/x-dtbncx+xml') {
      const ncxFile = zip.file(item.href)
      if (ncxFile) {
        const ncxContent = await ncxFile.async('string')
        tocChapters = parseNCX(ncxContent, opfDir)
        break
      }
    }
  }

  // If no NCX, look for NAV file (EPUB3)
  if (tocChapters.length === 0) {
    for (const [, item] of Object.entries(manifest)) {
      if (item.href.includes('nav') || item.mediaType === 'application/xhtml+xml') {
        const navFile = zip.file(item.href)
        if (navFile) {
          const navContent = await navFile.async('string')
          const parsed = parseNAV(navContent, opfDir)
          if (parsed.length > 0) {
            tocChapters = parsed
            break
          }
        }
      }
    }
  }

  // Create a map of href to chapter info from TOC
  const tocMap = new Map()
  tocChapters.forEach(ch => {
    tocMap.set(ch.href, ch.title)
  })

  // Extract text from each spine item in order, tracking chapter boundaries
  const chapters = []
  let wordCount = 0

  for (const href of spine) {
    const contentFile = zip.file(href)
    if (contentFile) {
      const html = await contentFile.async('string')
      const text = extractTextFromHTML(html)
      const cleanedText = text.trim()

      if (cleanedText) {
        // Determine chapter title
        let chapterTitle = tocMap.get(href)
        if (!chapterTitle) {
          chapterTitle = extractChapterTitle(html)
        }

        // Only add as a chapter if we have a title or it's from the TOC
        if (chapterTitle || tocMap.has(href)) {
          chapters.push({
            title: chapterTitle || `Section ${chapters.length + 1}`,
            startIndex: wordCount
          })
        }

        // Count words in this section
        const sectionWords = cleanedText.split(/\s+/).filter(w => w.length > 0)
        wordCount += sectionWords.length
      }
    }
  }

  // Re-extract full text (simpler approach)
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
    text: fullText,
    chapters: chapters.length > 1 ? chapters : null
  }
}
