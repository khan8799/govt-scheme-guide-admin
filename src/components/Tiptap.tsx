"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle, FontSize } from "@tiptap/extension-text-style"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { useState, useEffect } from "react"

interface TiptapProps {
  content?: string
  onChange?: (html: string) => void
}

const Tiptap = ({ content = "<p>Hello World! 🌎</p>", onChange }: TiptapProps) => {
  const [mode, setMode] = useState<"edit" | "preview" | "html">("edit")
  const [htmlValue, setHtmlValue] = useState(content)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
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
          "border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring focus:ring-blue-500 min-h-[250px] prose prose-sm max-w-none",
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

  const handleModeToggle = () => {
    if (mode === "edit") setMode("preview")
    else if (mode === "preview") setMode("html")
    else setMode("edit")
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
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Bold, Italic, Underline, Strike */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded ${editor.isActive("underline") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          U
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded ${editor.isActive("strike") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          S
        </button>

        {/* Headings */}
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <button
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
            className={`px-2 py-1 rounded ${editor.isActive("heading", { level }) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            H{level}
          </button>
        ))}

        {/* Align */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          ⬅
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          ⬍
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          ➡
        </button>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor.isActive("bulletList") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded ${editor.isActive("orderedList") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          1. List
        </button>

        {/* Quote */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded ${editor.isActive("blockquote") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          ❝ ❞
        </button>

        {/* Image Upload */}
        <label className="px-2 py-1 bg-gray-200 rounded cursor-pointer">
          Upload Image
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>

        {/* Undo / Redo */}
        <button onClick={() => editor.chain().focus().undo().run()} className="px-2 py-1 bg-gray-200 rounded">
          Undo
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} className="px-2 py-1 bg-gray-200 rounded">
          Redo
        </button>

        {/* Mode Toggle */}
        <button onClick={handleModeToggle} className="px-2 py-1 bg-green-500 text-white rounded ml-auto">
          {mode === "edit" ? "Preview" : mode === "preview" ? "HTML" : "Edit"}
        </button>
      </div>

      {/* Editor / Preview / HTML */}
      {mode === "edit" && <EditorContent editor={editor} />}

      {mode === "preview" && (
        <div
          className="border border-gray-300 rounded-md p-3 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlValue }}
        />
      )}

      {mode === "html" && (
        <textarea
          value={htmlValue}
          onChange={handleHtmlChange}
          className="border border-gray-300 rounded-md p-3 w-full h-64 font-mono text-sm"
        />
      )}
    </div>
  )
}

export default Tiptap
