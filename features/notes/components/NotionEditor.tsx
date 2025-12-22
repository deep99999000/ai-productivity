"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import { useEffect, useState, useCallback } from "react";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, getSuggestionItems, renderItems } from "@/components/tiptap/SlashCommand";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NotionEditorProps {
  content: string;
  onChange: (content: string) => void;
  noteTitle?: string;
}

export default function NotionEditor({ content, onChange, noteTitle }: NotionEditorProps) {
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState("");
  const [showBubbleMenu, setShowBubbleMenu] = useState(false);
  const [bubbleMenuPos, setBubbleMenuPos] = useState({ top: 0, left: 0 });
  const [showAIPromptDialog, setShowAIPromptDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [pendingEditor, setPendingEditor] = useState<any>(null);

  const handleAIGenerate = useCallback(async () => {
    try {
      setIsAILoading(true);
      setAiLoadingMessage("Generating content...");
      
      const response = await axios.post("/api/content/generate/todo", {
        todoName: noteTitle || "Note content",
        currentDescription: content,
      });

      if (response.data?.content) {
        return response.data.content;
      }
      return "";
    } catch (error) {
      console.error("AI generation error:", error);
      return "";
    } finally {
      setIsAILoading(false);
      setAiLoadingMessage("");
    }
  }, [noteTitle, content]);

  const handleAIGenerateWithPrompt = useCallback(async (prompt: string) => {
    try {
      setIsAILoading(true);
      setAiLoadingMessage("Generating content...");
      
      const response = await axios.post("/api/content/generate/todo", {
        todoName: prompt,
        currentDescription: content,
      });

      if (response.data?.content) {
        return response.data.content;
      }
      return "";
    } catch (error) {
      console.error("AI generation error:", error);
      return "";
    } finally {
      setIsAILoading(false);
      setAiLoadingMessage("");
    }
  }, [content]);

  const handleAIPromptSubmit = async () => {
    if (!aiPrompt.trim() || !pendingEditor) return;
    
    setShowAIPromptDialog(false);
    const generatedContent = await handleAIGenerateWithPrompt(aiPrompt);
    if (generatedContent) {
      pendingEditor.commands.insertContent(generatedContent);
    }
    setPendingEditor(null);
    setAiPrompt("");
  };

  const handleAIRefine = useCallback(async (currentContent: string, selectedText?: string) => {
    try {
      setIsAILoading(true);
      setAiLoadingMessage(selectedText ? "Refining selection..." : "Refining content...");
      
      const response = await axios.post("/api/content/refine/todo", {
        content: currentContent,
        selectedText,
        todoName: noteTitle,
      });

      if (response.data?.content) {
        return response.data.content;
      }
      return currentContent;
    } catch (error) {
      console.error("AI refinement error:", error);
      return currentContent;
    } finally {
      setIsAILoading(false);
      setAiLoadingMessage("");
    }
  }, [noteTitle]);

  const aiCommands = {
    enableAI: true,
    onGenerate: async (editor: any) => {
      setPendingEditor(editor);
      setAiPrompt("");
      setShowAIPromptDialog(true);
    },
    onRefine: async (editor: any) => {
      const currentContent = editor.getHTML();
      const { from, to } = editor.state.selection;
      let selectedText: string | undefined;
      
      if (from !== to) {
        selectedText = editor.state.doc.textBetween(from, to, ' ');
      }
      
      const refinedContent = await handleAIRefine(currentContent, selectedText);
      if (refinedContent) {
        if (selectedText) {
          editor.chain().focus().deleteRange({ from, to }).insertContent(refinedContent).run();
        } else {
          editor.commands.setContent(refinedContent);
        }
      }
    },
  };

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

          return "";
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
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // Get selection coordinates
        const { view } = editor;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        
        // Position bubble menu above selection
        setBubbleMenuPos({
          top: Math.min(start.top, end.top) - 50,
          left: (start.left + end.left) / 2,
        });
        setShowBubbleMenu(true);
      } else {
        setShowBubbleMenu(false);
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[300px]",
          "prose-headings:font-bold prose-headings:tracking-tight",
          "prose-h1:text-4xl prose-h1:mt-6 prose-h1:mb-4 prose-h1:text-gray-900",
          "prose-h2:text-3xl prose-h2:mt-5 prose-h2:mb-3 prose-h2:text-gray-800",
          "prose-h3:text-2xl prose-h3:mt-4 prose-h3:mb-2 prose-h3:text-gray-700",
          "prose-p:text-base prose-p:leading-7 prose-p:my-1 prose-p:text-gray-700",
          "prose-ul:my-2 prose-ol:my-2",
          "prose-li:my-0.5",
          "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-code:bg-gray-100 prose-code:text-pink-600 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
          "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg"
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="relative notion-editor">
      {/* AI Loading Overlay */}
      {isAILoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/95 to-blue-50/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="bg-white rounded-2xl shadow-2xl border border-purple-200 p-6 flex flex-col items-center gap-4">
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
            </div>
          </div>
        </div>
      )}

      {/* Custom Bubble Menu for formatting */}
      {showBubbleMenu && editor && (
        <div 
          className="fixed z-50 flex items-center gap-0.5 p-1.5 bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700"
          style={{
            top: bubbleMenuPos.top,
            left: bubbleMenuPos.left,
            transform: 'translateX(-50%)',
          }}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-2 rounded-md hover:bg-gray-700 transition-colors",
              editor.isActive("bold") && "bg-gray-700 text-blue-400"
            )}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 rounded-md hover:bg-gray-700 transition-colors",
              editor.isActive("italic") && "bg-gray-700 text-blue-400"
            )}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              "p-2 rounded-md hover:bg-gray-700 transition-colors",
              editor.isActive("strike") && "bg-gray-700 text-blue-400"
            )}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "p-2 rounded-md hover:bg-gray-700 transition-colors",
              editor.isActive("code") && "bg-gray-700 text-blue-400"
            )}
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-600 mx-1"></div>

          <button
            onClick={async () => {
              const { from, to } = editor.state.selection;
              if (from !== to) {
                const selectedText = editor.state.doc.textBetween(from, to, ' ');
                const refined = await handleAIRefine(editor.getHTML(), selectedText);
                if (refined) {
                  editor.chain().focus().deleteRange({ from, to }).insertContent(refined).run();
                }
              }
            }}
            className="p-2 rounded-md hover:bg-purple-600 bg-purple-700 text-white transition-colors flex items-center gap-1.5 px-3"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">Refine</span>
          </button>
        </div>
      )}

      {/* AI Prompt Dialog */}
      <Dialog open={showAIPromptDialog} onOpenChange={setShowAIPromptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Generate with AI
            </DialogTitle>
            <DialogDescription>
              Describe what you want to generate and AI will create it for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Write a brief introduction about..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAIPromptSubmit();
                }
              }}
              autoFocus
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAIPromptDialog(false);
                setPendingEditor(null);
                setAiPrompt("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAIPromptSubmit}
              disabled={!aiPrompt.trim() || isAILoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAILoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="min-h-[300px]"
      />

      {/* Quick Add Hint */}
      {editor.isEmpty && (
        <div className="text-gray-400 text-sm mt-4">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono text-xs">/</kbd> to browse blocks, or just start typing...
        </div>
      )}
    </div>
  );
}
