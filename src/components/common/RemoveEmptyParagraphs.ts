import { Extension } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { Fragment, Node as PMNode, Slice } from 'prosemirror-model'

function isWhitespaceOnlyText(node: PMNode) {
  return node.isText && /^\s*$/.test(node.text || '')
}

function isHardBreak(node: PMNode) {
  return node.type.name === 'hardBreak'
}

function isEmptyParagraph(node: PMNode) {
  if (node.type.name !== 'paragraph') return false
  if (node.childCount === 0) return true

  // Consider paragraph empty if it contains only whitespace text and/or hard breaks
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i)
    if (!(isWhitespaceOnlyText(child) || isHardBreak(child))) {
      return false
    }
  }
  return true
}

/**
 * Clean a Fragment by removing empty paragraphs and recursively cleaning children.
 */
function cleanFragment(fragment: Fragment): Fragment {
  const children: PMNode[] = []
  for (let i = 0; i < fragment.childCount; i++) {
    const child = fragment.child(i)

    // Recurse into block nodes
    let cleanedChild = child
    if (child.content && child.content.childCount > 0) {
      const cleanedContent = cleanFragment(child.content)
      if (cleanedContent !== child.content) {
        cleanedChild = child.copy(cleanedContent)
      }
    }
    // Skip empty paragraphs
    if (isEmptyParagraph(cleanedChild)) continue

    children.push(cleanedChild)
  }
  return Fragment.fromArray(children)
}

/**
 * Remove empty paragraphs from the document, but keep the final caret paragraph if it's the only node.
 * Also allow one final caret paragraph at the very end of the doc; remove others.
 */
function removeEmptyParagraphsFromDoc(doc: PMNode) {
  const emptyPositions: Array<{ from: number; to: number }> = []

  doc.descendants((node, pos) => {
    if (isEmptyParagraph(node)) {
      emptyPositions.push({ from: pos, to: pos + node.nodeSize })
    }
  })

  const keepIfSingleDoc =
    doc.childCount === 1 && doc.firstChild && isEmptyParagraph(doc.firstChild)

  if (!keepIfSingleDoc && emptyPositions.length > 0) {
    const last = emptyPositions[emptyPositions.length - 1]

    const endsAtDocEnd = last.to === doc.content.size

    if (endsAtDocEnd) {
      emptyPositions.pop()
    }
  }

  return emptyPositions
}


export const RemoveEmptyParagraphs = Extension.create({
  name: 'removeEmptyParagraphs',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {

          transformPasted(slice: Slice) {
            const cleaned = cleanFragment(slice.content)
            return new Slice(cleaned, slice.openStart, slice.openEnd)
          },
        },


        appendTransaction(_transactions, oldState, newState) {
          // Avoid running if nothing changed
          if (oldState.doc.eq(newState.doc)) return null

          const tr = newState.tr
          const toDelete = removeEmptyParagraphsFromDoc(newState.doc)

          if (toDelete.length === 0) return null

          // Delete from bottom to top to keep positions valid
          for (let i = toDelete.length - 1; i >= 0; i--) {
            const { from, to } = toDelete[i]
            tr.delete(from, to)
          }

          return tr
        },
      }),
    ]
  },
})