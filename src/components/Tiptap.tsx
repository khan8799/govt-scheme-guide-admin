"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle } from "@tiptap/extension-text-style"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import { useState, useEffect } from "react"
import "./Tiptap.css"

interface TiptapProps {
  content?: string
  onChange?: (html: string) => void
}

const Tiptap = ({ content = "<p>Hello World! 🌎</p>", onChange }: TiptapProps) => {
  const [mode, setMode] = useState<"edit" | "preview" | "html">("edit")
  const [htmlValue, setHtmlValue] = useState(content)

  const editor = useEditor({
    extensions: [
      // Configure table extensions first
      Table.configure({
        resizable: true,
      }),
      TableRow.configure({}),
      TableHeader.configure({}),
      TableCell.configure({}),
      StarterKit,
      TextStyle,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "border border-gray-300 rounded-md shadow-sm p-4 focus:outline-none focus:ring focus:ring-blue-500 min-h-[300px] prose prose-sm max-w-none",
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    // Update htmlValue when editor changes
    const update = () => {
      const html = editor.getHTML()
      setHtmlValue(html)
      if (onChange) onChange(html)
    }
    editor.on("update", update)
    return () => {
      editor.off("update", update)
    }
  }, [editor, onChange])

  if (!editor) return null

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      editor.chain().focus().setImage({ src }).run()
    }
    reader.readAsDataURL(file)
  }

  const handleModeChange = (newMode: "edit" | "preview" | "html") => {
    setMode(newMode)
  }

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlValue(e.target.value)
    editor.commands.setContent(e.target.value, {
      parseOptions: {},      // optional
      emitUpdate: true,      // trigger "update" event
      errorOnInvalidContent: false, // optional
    });   
    if (onChange) onChange(e.target.value)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-16 z-50 bg-white border-b border-gray-200 py-3 flex flex-wrap gap-2 mb-3 shadow-sm">
        {/* Bold, Italic, Underline, Strike */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={`px-2 py-1 rounded ${editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={`px-2 py-1 rounded ${editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
          className={`px-2 py-1 rounded ${editor.isActive("underline") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          U
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleStrike().run();
          }}
          className={`px-2 py-1 rounded ${editor.isActive("strike") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          S
        </button>

        {/* Headings */}
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <button
            key={level}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
            }}
            className={`px-2 py-1 rounded ${editor.isActive("heading", { level }) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            H{level}
          </button>
        ))}

        {/* Align */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().setTextAlign("left").run();
          }}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().setTextAlign("center").run();
          }}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          ⬍
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().setTextAlign("right").run();
          }}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          ➡
        </button>

        {/* Lists */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={`px-2 py-1 rounded ${editor.isActive("bulletList") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={`px-2 py-1 rounded ${editor.isActive("orderedList") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          1. List
        </button>

        {/* Tables */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            try {
              console.log('Inserting table...')
              const result = editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              console.log('Table insert result:', result)
            } catch (error) {
              console.error('Error inserting table:', error)
            }
          }}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          📊 Table
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            try {
              if (editor.isActive('tableCell') || editor.isActive('tableHeader')) {
                editor.chain().focus().addColumnBefore().run()
              }
            } catch (error) {
              console.error('Error adding column before:', error)
            }
          }}
          disabled={!(editor.isActive('tableCell') || editor.isActive('tableHeader'))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ➕ Col
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            try {
              if (editor.isActive('tableCell') || editor.isActive('tableHeader')) {
                editor.chain().focus().addColumnAfter().run()
              }
            } catch (error) {
              console.error('Error adding column after:', error)
            }
          }}
          disabled={!(editor.isActive('tableCell') || editor.isActive('tableHeader'))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ➕ Col
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            try {
              if (editor.isActive('tableCell') || editor.isActive('tableHeader')) {
                editor.chain().focus().deleteColumn().run()
              }
            } catch (error) {
              console.error('Error deleting column:', error)
            }
          }}
          disabled={!(editor.isActive('tableCell') || editor.isActive('tableHeader'))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ➖ Col
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            try {
              if (editor.isActive('tableCell') || editor.isActive('tableHeader')) {
                editor.chain().focus().addRowBefore().run()
              }
            } catch (error) {
              console.error('Error adding row before:', error)
            }
          }}
          disabled={!(editor.isActive('tableCell') || editor.isActive('tableHeader'))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ➕ Row
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            try {
              if (editor.isActive('tableCell') || editor.isActive('tableHeader')) {
                editor.chain().focus().addRowAfter().run()
              }
            } catch (error) {
              console.error('Error adding row after:', error)
            }
          }}
          disabled={!(editor.isActive('tableCell') || editor.isActive('tableHeader'))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ➕ Row
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            try {
              if (editor.isActive('tableCell') || editor.isActive('tableHeader')) {
                editor.chain().focus().deleteRow().run()
              }
            } catch (error) {
              console.error('Error deleting row:', error)
            }
          }}
          disabled={!(editor.isActive('tableCell') || editor.isActive('tableHeader'))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ➖ Row
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            try {
              if (editor.isActive('tableCell') || editor.isActive('tableHeader')) {
                editor.chain().focus().deleteTable().run()
              }
            } catch (error) {
              console.error('Error deleting table:', error)
            }
          }}
          disabled={!(editor.isActive('tableCell') || editor.isActive('tableHeader'))}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          🗑️ Table
        </button>

        {/* Quote */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }}
          className={`px-2 py-1 rounded ${editor.isActive("blockquote") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          ❝ ❞
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            const url = window.prompt('Enter URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={`px-2 py-1 rounded ${editor.isActive("link") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          🔗 Link
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().unsetLink().run();
          }}
          disabled={!editor.isActive("link")}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          🔗 Unlink
        </button>

        {/* Image Upload */}
        <label className="px-2 py-1 bg-gray-200 rounded cursor-pointer">
          Upload Image
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>

        {/* Undo / Redo */}
        <button type="button" onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().undo().run();
        }} className="px-2 py-1 bg-gray-200 rounded">
          Undo
        </button>
        <button type="button" onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().redo().run();
        }} className="px-2 py-1 bg-gray-200 rounded">
          Redo
        </button>

        {/* Mode Buttons - All visible at once */}
        <div className="flex gap-2 ml-auto">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleModeChange("edit");
            }} 
            className={`px-3 py-1 rounded ${mode === "edit" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Edit
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleModeChange("preview");
            }} 
            className={`px-3 py-1 rounded ${mode === "preview" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Preview
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleModeChange("html");
            }} 
            className={`px-3 py-1 rounded ${mode === "html" ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            HTML
          </button>
        </div>
      </div>

      {/* Editor / Preview / HTML */}
      {mode === "edit" && (
        <div className="min-h-[300px]">
          <EditorContent editor={editor} />
        </div>
      )}

      {mode === "preview" && (
        <div
          className="border border-gray-300 rounded-md p-4 min-h-[300px] prose prose-sm max-w-none overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: htmlValue }}
        />
      )}

      {mode === "html" && (
        <textarea
          value={htmlValue}
          onChange={handleHtmlChange}
          className="border border-gray-300 rounded-md p-4 w-full min-h-[300px] font-mono text-sm resize-none"
        />
      )}
    </div>
  )
}

export default Tiptap