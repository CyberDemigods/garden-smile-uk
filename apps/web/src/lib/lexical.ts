/**
 * Minimal Lexical → plain text extractor for product/blog descriptions.
 * Handles the shapes our seed/CMS write today (root → paragraphs → text nodes).
 * Anything richer (lists, headings, links) becomes plain text — we'll plug
 * in a full renderer when the storefront needs proper formatting.
 */
interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
}

interface LexicalDoc {
  root?: LexicalNode
}

export function lexicalToParagraphs(value: unknown): string[] {
  const doc = value as LexicalDoc | null | undefined
  if (!doc?.root?.children) return []

  const paragraphs: string[] = []
  for (const child of doc.root.children) {
    const text = collectText(child).trim()
    if (text) paragraphs.push(text)
  }
  return paragraphs
}

function collectText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  if (!node.children) return ''
  return node.children.map(collectText).join('')
}
