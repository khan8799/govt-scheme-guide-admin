"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Color } from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import { useState, useEffect, JSX, useRef } from "react"
import { RemoveEmptyParagraphs } from "./common/RemoveEmptyParagraphs"

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
  const [isApplying, setIsApplying] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
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
      Table.configure({
        resizable: true,
      }),
      TableRow.configure({}),
      TableHeader.configure({}),
      TableCell.configure({}),
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
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
    RemoveEmptyParagraphs,

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
    } else if (editor.isActive({ textAlign: "justify" })) {
      newSelectionInfo.textAlign = "justify"
    }

    setSelectionInfo(newSelectionInfo)
  }

  useEffect(() => {
    if (!editor) return
    
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
    if (newMode === "html") {
      setHtmlValue(editor.getHTML())
    }
  }

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlValue(e.target.value)
  }

  const applyHtmlChanges = () => {
    if (!editor) return
    
    setIsApplying(true)
    
    // Use setTimeout to allow the UI to update before applying changes
    setTimeout(() => {
      try {
        // Create a temporary element to sanitize HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlValue
        
        // Remove any problematic elements or attributes
        const scripts = tempDiv.querySelectorAll('script')
        scripts.forEach(script => script.remove())
        
        // Set the sanitized content
        editor.commands.setContent(tempDiv.innerHTML)
        
        // Force a focus and selection update
        editor.commands.focus('end')
      } catch (error) {
        console.error('Error applying HTML changes:', error)
        // Fallback to safe content if there's an error
        editor.commands.setContent('<p>Error applying HTML. Content reset.</p>')
      } finally {
        setIsApplying(false)
        setMode("edit")
      }
    }, 100)
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
    <div className="p-4 bg-white rounded-lg shadow-md">
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
          {/* Mode Buttons */}
          <div className="flex gap-2 mr-4">
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
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign("justify").run();
            }}
            className={`px-2 py-1 rounded ${editor.isActive({ textAlign: "justify" }) ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            ≡
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
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            }}
            className={`px-2 py-1 rounded ${editor.isActive("table") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Table
          </button>
          
          {editor?.isActive("table") && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().addColumnAfter().run();
                }}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +Col
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().addRowAfter().run();
                }}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +Row
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().deleteColumn().run();
                }}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -Col
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().deleteRow().run();
                }}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                -Row
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  editor.chain().focus().deleteTable().run();
                }}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                × Table
              </button>
            </>
          )}

          {/* Quote */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
            }}
            className={`px-2 py-1 rounded ${editor.isActive("blockquote") ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Quote
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
            Link
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
            Unlink
          </button>

          {/* Text Colors */}
          <div className="flex items-center gap-1">
            <input
              type="color"
              onChange={(e) => {
                editor.chain().focus().setColor(e.target.value).run()
              }}
              value={editor.getAttributes("textStyle").color || "#000000"}
              className="w-8 h-8 p-0 border rounded cursor-pointer"
              title="Text Color"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                editor.chain().focus().unsetColor().run()
              }}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              title="Reset Color"
            >
              🗑️
            </button>
          </div>

          {/* Image Upload */}
          <label className="px-2 py-1 bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
            📷 Image
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {/* Undo / Redo */}
          <button type="button" onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run();
          }} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
            Undo
          </button>
          <button type="button" onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">
            Redo
          </button>
        </div>
      </div>

      {/* Editor / Preview / HTML */}
      {mode === "edit" && (
        <div className="min-h-[300px] mt-4" ref={editorRef}>
          <EditorContent editor={editor} />
        </div>
      )}

      {mode === "preview" && (
        <div
          className="border border-gray-300 rounded-md p-4 min-h-[300px] prose prose-sm max-w-none overflow-y-auto mt-4"
          dangerouslySetInnerHTML={{ __html: htmlValue }}
        />
      )}

      {mode === "html" && (
        <div className="relative mt-4">
          <textarea
            value={htmlValue}
            onChange={handleHtmlChange}
            className="border border-gray-300 rounded-md p-4 w-full min-h-[300px] font-mono text-sm resize-none"
            placeholder="Enter your HTML here..."
          />
          <button
            onClick={applyHtmlChanges}
            disabled={isApplying}
            className={`absolute bottom-4 right-4 px-4 py-2 text-white rounded-md ${isApplying ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isApplying ? 'Applying...' : 'Apply Changes'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Tiptap