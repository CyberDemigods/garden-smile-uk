import { readFile } from 'fs/promises'
import { extname, join } from 'path'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
}

/**
 * Serve uploaded media files from the local staticDir.
 *
 * Payload v3's catch-all (payload)/api/[...slug] returns 404 for static
 * file requests in dev — so we expose this specific route at higher
 * priority. It reads from the configured staticDir on disk and streams
 * the file with the right content-type.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params

  // Path traversal guard.
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new Response('Bad request', { status: 400 })
  }

  // staticDir for the media collection is `media` (relative to the app cwd).
  const filePath = join(process.cwd(), 'media', filename)

  try {
    const file = await readFile(filePath)
    const contentType = MIME[extname(filename).toLowerCase()] || 'application/octet-stream'
    return new Response(file as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
