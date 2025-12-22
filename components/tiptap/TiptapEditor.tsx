"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import { Command, getSuggestionItems, renderItems, type AICommandOptions } from "./SlashCommand";
import { useEffect, useState } from "react";
import { Bold, Italic, Strikethrough, Code, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  content: string | null;
  onChange: (content: string) => void;
  editable?: boolean;
  variant?: "default" | "ghost";
  enableAI?: boolean;
  onAIGenerate?: () => Promise<string>;
  onAIRefine?: (currentContent: string, selectedText?: string) => Promise<string>;
}

const TiptapEditor = ({ content, onChange, editable = true, variant = "default", enableAI = false, onAIGenerate, onAIRefine }: TiptapEditorProps) => {
  const [bubbleMenuPos, setBubbleMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState("");

  const handleAIGenerate = async (editor: any) => {
    if (!onAIGenerate) return;
    
    try {
      setIsAILoading(true);
      setAiLoadingMessage("Generating content...");
      const generatedContent = await onAIGenerate();
      if (generatedContent) {
        editor.commands.setContent(generatedContent);
      }
    } catch (error) {
      console.error("AI generation error:", error);
      setAiLoadingMessage("Generation failed");
      setTimeout(() => setIsAILoading(false), 1500);
    } finally {
      setTimeout(() => {
        setIsAILoading(false);
        setAiLoadingMessage("");
      }, 500);
    }
  };

  const handleAIRefine = async (editor: any, selectedOnly = false) => {
    if (!onAIRefine) return;
    
    try {
      setIsAILoading(true);
      setAiLoadingMessage(selectedOnly ? "Refining selection..." : "Refining content...");
      
      const currentContent = editor.getHTML();
      let selectedText: string | undefined;
      
      if (selectedOnly) {
        const { from, to } = editor.state.selection;
        if (from !== to) {
          selectedText = editor.state.doc.textBetween(from, to, ' ');
        }
      }
      
      const refinedContent = await onAIRefine(currentContent, selectedText);
      if (refinedContent) {
        if (selectedOnly && selectedText) {
          // Replace only the selected portion
          const { from, to } = editor.state.selection;
          editor.chain().focus().deleteRange({ from, to }).insertContent(refinedContent).run();
        } else {
          editor.commands.setContent(refinedContent);
        }
      }
    } catch (error) {
      console.error("AI refinement error:", error);
      setAiLoadingMessage("Refinement failed");
      setTimeout(() => setIsAILoading(false), 1500);
    } finally {
      setTimeout(() => {
        setIsAILoading(false);
        setAiLoadingMessage("");
      }, 500);
    }
  };

  const aiCommands = enableAI ? {
    enableAI: true,
    onGenerate: handleAIGenerate,
    onRefine: handleAIRefine,
  } : undefined;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Heading';
          }
          return "Type '/' for commands, or start writing...";
        },
        includeChildren: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image,
      Command.configure({
        suggestion: {
          items: (props: any) => getSuggestionItems(props, aiCommands),
          render: renderItems,
        },
      }),
    ],
    content: content || "",
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[150px]",
          "prose-headings:font-bold prose-headings:tracking-tight",
          "prose-h1:text-4xl prose-h1:mt-6 prose-h1:mb-4 prose-h1:text-gray-900",
          "prose-h2:text-3xl prose-h2:mt-5 prose-h2:mb-3 prose-h2:text-gray-800",
          "prose-h3:text-2xl prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-gray-700",
          "prose-p:text-base prose-p:leading-7 prose-p:my-2 prose-p:text-gray-700",
          "prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6",
          "prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6",
          "prose-li:my-1 prose-li:text-gray-700",
          "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:my-4",
          "prose-code:bg-gray-100 prose-code:text-pink-600 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-4 prose-pre:overflow-x-auto",
          "prose-hr:border-gray-200 prose-hr:my-6",
          "prose-strong:text-gray-900 prose-strong:font-semibold",
          variant === "default" ? "px-4 py-3" : "px-0 py-0"
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (editor.isEmpty && !content) return;
      // editor.commands.setContent(content || "");
    }
  }, [content, editor]);
  
  useEffect(() => {
      if (editor && content !== editor.getHTML()) {
          editor.commands.setContent(content || "");
      }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;

    const updateBubbleMenu = () => {
      const { selection } = editor.state;
      if (selection.empty) {
        setBubbleMenuPos(null);
        return;
      }

      const { from, to } = selection;
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      
      const left = (start.left + end.right) / 2;
      const top = start.top - 10;

      setBubbleMenuPos({ top, left });
    };

    editor.on("selectionUpdate", updateBubbleMenu);
    editor.on("blur", () => setBubbleMenuPos(null));

    return () => {
      editor.off("selectionUpdate", updateBubbleMenu);
      editor.off("blur", () => setBubbleMenuPos(null));
    };
  }, [editor]);


  if (!editor) {
    return null;
  }

  return (
    <div className={cn("w-full relative", variant === "default" && "border rounded-md border-stone-200 bg-white shadow-sm overflow-hidden")}>
      {isAILoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/95 to-blue-50/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl border border-purple-200 p-6 flex flex-col items-center gap-4 min-w-[280px]">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <Sparkles className="w-8 h-8 text-purple-600 relative z-10" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-1.5 w-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-1.5 w-1.5 bg-purple-600 rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm font-medium text-purple-900">{aiLoadingMessage}</span>
              <span className="text-xs text-purple-600">AI is working its magic</span>
            </div>
          </div>
        </div>
      )}
      {bubbleMenuPos && !isAILoading && (
        <div 
            className="fixed z-50 flex items-center gap-0.5 p-1.5 bg-gray-900 text-white rounded-lg shadow-2xl transform -translate-x-1/2 -translate-y-full border border-gray-700"
            style={{ top: bubbleMenuPos.top, left: bubbleMenuPos.left }}
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
        >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                "p-2 rounded-md hover:bg-gray-700 transition-colors",
                editor.isActive("bold") && "bg-gray-700 text-blue-400"
              )}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                "p-2 rounded-md hover:bg-gray-700 transition-colors",
                editor.isActive("italic") && "bg-gray-700 text-blue-400"
              )}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(
                "p-2 rounded-md hover:bg-gray-700 transition-colors",
                editor.isActive("strike") && "bg-gray-700 text-blue-400"
              )}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={cn(
                "p-2 rounded-md hover:bg-gray-700 transition-colors",
                editor.isActive("code") && "bg-gray-700 text-blue-400"
              )}
              title="Code"
            >
              <Code className="w-4 h-4" />
            </button>
            {enableAI && onAIRefine && (
              <>
                <div className="h-4 w-px bg-gray-600 mx-1"></div>
                <button
                  onClick={() => handleAIRefine(editor, true)}
                  className="p-2 rounded-md hover:bg-purple-600 bg-purple-700 text-white transition-colors flex items-center gap-1.5 px-3"
                  title="Refine selected text with AI"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-medium">Refine</span>
                </button>
              </>
            )}
        </div>
      )}
      <EditorContent editor={editor} className={cn("w-full h-full", variant === "ghost" && "min-h-[calc(100vh-200px)]")} />
    </div>
  );
};

export default TiptapEditor;
