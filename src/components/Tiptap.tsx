"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import { useState, useEffect, JSX } from "react"
import "./Tiptap.css"

interface TiptapProps {
  content?: string
  onChange?: (html: string) => void
}

interface SelectionInfo {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  headingLevel: number | null;
  textAlign: string | null;
  isBulletList: boolean;
  isOrderedList: boolean;
  isBlockquote: boolean;
  isLink: boolean;
  color: string | null;
  isTable: boolean;
  isTableCell: boolean;
  isTableHeader: boolean;
}

const Tiptap = ({ content = "<p>Hello World! 🌎</p>", onChange }: TiptapProps) => {
  const [mode, setMode] = useState<"edit" | "preview" | "html">("edit")
  const [htmlValue, setHtmlValue] = useState(content)
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrike: false,
    headingLevel: null,
    textAlign: null,
    isBulletList: false,
    isOrderedList: false,
    isBlockquote: false,
    isLink: false,
    color: null,
    isTable: false,
    isTableCell: false,
    isTableHeader: false,
  })

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
      Color,
      TextStyle,
      Underline,
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
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
    onSelectionUpdate: () => {
      updateSelectionInfo()
    },
    onUpdate: () => {
      updateSelectionInfo()
    },
  })

  const updateSelectionInfo = () => {
    if (!editor) return
    
    const newSelectionInfo: SelectionInfo = {
      isBold: editor.isActive("bold"),
      isItalic: editor.isActive("italic"),
      isUnderline: editor.isActive("underline"),
      isStrike: editor.isActive("strike"),
      headingLevel: null,
      textAlign: null,
      isBulletList: editor.isActive("bulletList"),
      isOrderedList: editor.isActive("orderedList"),
      isBlockquote: editor.isActive("blockquote"),
      isLink: editor.isActive("link"),
      color: editor.getAttributes("textStyle").color || null,
      isTable: editor.isActive("table"),
      isTableCell: editor.isActive("tableCell"),
      isTableHeader: editor.isActive("tableHeader"),
    }

    // Check heading levels
    for (let level = 1; level <= 6; level++) {
      if (editor.isActive("heading", { level })) {
        newSelectionInfo.headingLevel = level
        break
      }
    }

    // Check text alignment
    if (editor.isActive({ textAlign: "left" })) {
      newSelectionInfo.textAlign = "left"
    } else if (editor.isActive({ textAlign: "center" })) {
      newSelectionInfo.textAlign = "center"
    } else if (editor.isActive({ textAlign: "right" })) {
      newSelectionInfo.textAlign = "right"
    }

    setSelectionInfo(newSelectionInfo)
  }

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

  useEffect(() => {
    if (!editor) return
    
    // Update selection info when editor changes
    const update = () => {
      updateSelectionInfo()
    }
    
    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    
    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor])

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

  const FormatBadge = ({ type, value }: { type: string; value?: string }) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    
    switch(type) {
      case "Bold":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case "Italic":
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        break;
      case "Underline":
        bgColor = "bg-cyan-100";
        textColor = "text-cyan-800";
        break;
      case "Strikethrough":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "Align":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case "Bullet List":
      case "Ordered List":
        bgColor = "bg-indigo-100";
        textColor = "text-indigo-800";
        break;
      case "Blockquote":
        bgColor = "bg-amber-100";
        textColor = "text-amber-800";
        break;
      case "Link":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case "Color":
        bgColor = "bg-pink-100";
        textColor = "text-pink-800";
        break;
      case "Table":
      case "Table Cell":
      case "Table Header":
        bgColor = "bg-teal-100";
        textColor = "text-teal-800";
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} mr-2 mb-1`}>
        {type}{value ? `: ${value}` : ""}
      </span>
    );
  };

  const formatSelectionInfo = (info: SelectionInfo): JSX.Element[] => {
    const activeFormats: JSX.Element[] = [];
    
    if (info.isBold) activeFormats.push(<FormatBadge key="bold" type="Bold" />);
    if (info.isItalic) activeFormats.push(<FormatBadge key="italic" type="Italic" />);
    if (info.isUnderline) activeFormats.push(<FormatBadge key="underline" type="Underline" />);
    if (info.isStrike) activeFormats.push(<FormatBadge key="strike" type="Strikethrough" />);
    if (info.headingLevel) activeFormats.push(<FormatBadge key={`h${info.headingLevel}`} type={`H${info.headingLevel}`} />);
    if (info.textAlign) activeFormats.push(<FormatBadge key={`align-${info.textAlign}`} type="Align" value={info.textAlign.charAt(0).toUpperCase() + info.textAlign.slice(1)} />);
    if (info.isBulletList) activeFormats.push(<FormatBadge key="bullet-list" type="Bullet List" />);
    if (info.isOrderedList) activeFormats.push(<FormatBadge key="ordered-list" type="Ordered List" />);
    if (info.isBlockquote) activeFormats.push(<FormatBadge key="blockquote" type="Blockquote" />);
    if (info.isLink) activeFormats.push(<FormatBadge key="link" type="Link" />);
    if (info.color) activeFormats.push(<FormatBadge key="color" type="Color" value={info.color} />);
    if (info.isTable) activeFormats.push(<FormatBadge key="table" type="Table" />);
    if (info.isTableCell) activeFormats.push(<FormatBadge key="table-cell" type="Table Cell" />);
    if (info.isTableHeader) activeFormats.push(<FormatBadge key="table-header" type="Table Header" />);
    
    return activeFormats.length > 0 ? activeFormats : [<span key="plain-text" className="text-gray-500">Plain Text</span>];
  };

  return (
    <div>
      <div className="sticky top-19 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* Selection Info Bar */}
        <div className="bg-gray-100 p-2 text-sm text-gray-700 border-b border-gray-300 flex items-center flex-wrap">
          <strong className="mr-2 whitespace-nowrap">Selection Formatting:</strong> 
          <div className="flex flex-wrap items-center">
            {formatSelectionInfo(selectionInfo)}
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-1 py-3 flex flex-wrap gap-2">
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

          {/* Text Colors */}
          <input
            type="color"
            onChange={(e) => {
              editor.chain().focus().setColor(e.target.value).run()
            }}
            value={editor.getAttributes("textStyle").color || "#000000"}
            className="w-10 h-8 p-0 border rounded cursor-pointer"
          />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              editor.chain().focus().unsetColor().run()
            }}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset Color
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