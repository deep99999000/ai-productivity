import React, { useEffect, useState } from "react";
import {
  List,
  ListOrdered,
  Sparkles,
  Wand2,
  Type,
  Hash,
  ListTodo,
  Quote,
  FileCode,
  Ruler,
} from "lucide-react";
import { Editor, Range, Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

interface CommandItemProps {
  title: string;
  description: string;
  icon: React.ElementType;
  command?: (args: { editor: Editor; range: Range }) => void;
  isAI?: boolean;
  color?: string;
  bgColor?: string;
  searchTerms?: string[];
}

interface CommandProps {
  editor: Editor;
  range: Range;
}

interface AICommandOptions {
  onGenerate?: (editor: any, range?: Range) => void | Promise<void>;
  onRefine?: (editor: any, selectedOnly?: boolean) => void | Promise<void>;
  enableAI?: boolean;
}

const Command = Extension.create({
  name: "slash-command",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: { command: (args: { editor: Editor; range: Range }) => void };
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

const getSuggestionItems = ({ query }: { query: string }, aiCommands?: AICommandOptions) => {
  const baseItems = [
    {
      title: "Text",
      description: "Plain text paragraph",
      searchTerms: ["p", "paragraph"],
      icon: Type,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      command: ({ editor, range }: CommandProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleNode("paragraph", "paragraph")
          .run();
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading",
      searchTerms: ["title", "big", "large", "h1"],
      icon: Hash,
      color: "text-red-600",
      bgColor: "bg-red-50",
      command: ({ editor, range }: CommandProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      searchTerms: ["subtitle", "medium", "h2"],
      icon: Hash,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      command: ({ editor, range }: CommandProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      searchTerms: ["subtitle", "small", "h3"],
      icon: Hash,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      command: ({ editor, range }: CommandProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run();
      },
    },
    {
      title: "Bullet List",
      description: "Simple bulleted list",
      searchTerms: ["unordered", "point", "ul"],
      icon: List,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered List",
      description: "List with numbering",
      searchTerms: ["ordered", "ol", "1"],
      icon: ListOrdered,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "To-do List",
      description: "Track tasks with checkboxes",
      searchTerms: ["todo", "task", "list", "check", "checkbox"],
      icon: ListTodo,
      color: "text-green-600",
      bgColor: "bg-green-50",
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: "Quote",
      description: "Capture a quote or callout",
      searchTerms: ["blockquote", "callout"],
      icon: Quote,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      command: ({ editor, range }: CommandProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("blockquote")
          .run();
      },
    },
    {
      title: "Code Block",
      description: "Code snippet with syntax",
      searchTerms: ["codeblock", "code", "snippet"],
      icon: FileCode,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Divider",
      description: "Visual separator line",
      searchTerms: ["line", "hr", "separator", "---"],
      icon: Ruler,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ];

  // Add AI commands if enabled
  const aiItems = [];
  if (aiCommands?.enableAI) {
    if (aiCommands.onGenerate) {
      aiItems.push({
        title: "AI Generate",
        description: "Generate content with AI",
        searchTerms: ["ai", "generate", "create", "write"],
        icon: Sparkles,
        color: "text-purple-600",
        bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
        isAI: true,
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).run();
          aiCommands.onGenerate?.(editor, range);
        },
      });
    }
    
    if (aiCommands.onRefine) {
      aiItems.push({
        title: "AI Refine",
        description: "Improve with AI assistance",
        searchTerms: ["ai", "refine", "improve", "enhance"],
        icon: Wand2,
        color: "text-violet-600",
        bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
        isAI: true,
        command: ({ editor, range }: CommandProps) => {
          editor.chain().focus().deleteRange(range).run();
          // Pass false for selectedOnly since this is from slash command (not text selection)
          aiCommands.onRefine?.(editor, false);
        },
      });
    }
  }

  const allItems = [...aiItems, ...baseItems];

  return allItems.filter((item) => {
    if (typeof query === "string" && query.length > 0) {
      const search = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        (item.searchTerms &&
          item.searchTerms.some((term: string) => term.includes(search)))
      );
    }
    return true;
  });
};

export const renderItems = () => {
  let component: ReactRenderer | null = null;
  let popup: Instance[] | null = null;

  return {
    onStart: (props: { editor: Editor; clientRect: (() => DOMRect) | null }) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      const getReferenceClientRect = () => props.clientRect?.() ?? new DOMRect(0, 0, 0, 0);

      popup = tippy("body", {
        getReferenceClientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
        maxWidth: 400,
        offset: [0, 8],
        theme: "light",
        arrow: false,
        popperOptions: {
          strategy: "fixed",
          modifiers: [
            {
              name: "flip",
              options: {
                fallbackPlacements: ["top-start", "bottom-start"],
              },
            },
          ],
        },
      });
    },
    onUpdate: (props: { editor: Editor; clientRect: (() => DOMRect) | null }) => {
      component?.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      const getReferenceClientRect = () => props.clientRect?.() ?? new DOMRect(0, 0, 0, 0);

      popup?.[0].setProps({
        getReferenceClientRect,
      });
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === "Escape") {
        popup?.[0].hide();

        return true;
      }

      // @ts-expect-error - component ref type is not fully defined
      return component?.ref?.onKeyDown(props);
    },
    onExit: () => {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};

const CommandList = React.forwardRef(
  ({ items, command }: { items: CommandItemProps[]; command: (item: CommandItemProps) => void }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    };

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    React.useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    // Separate AI items from regular items
    const aiItems = items.filter((item: any) => item.isAI);
    const regularItems = items.filter((item: any) => !item.isAI);

    return (
      <div className="z-50 h-auto max-h-[400px] w-80 overflow-y-auto rounded-xl bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-100 py-2 transition-all">
        {aiItems.length > 0 && (
          <>
            <div className="px-3 pb-2 pt-1.5">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">AI Tools</p>
            </div>
            {aiItems.map((item: any, idx: number) => {
              const index = items.indexOf(item);
              return (
                <button
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all rounded-lg mx-1 ${
                    index === selectedIndex ? "bg-gradient-to-r from-blue-50 to-purple-50" : "hover:bg-gray-50"
                  }`}
                  key={index}
                  onClick={() => selectItem(index)}
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${item.bgColor || "bg-purple-50"}`}>
                    {item.icon && <item.icon className={`h-5 w-5 ${item.color || "text-purple-600"}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${item.color || "text-gray-900"}`}>{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                </button>
              );
            })}
            <div className="my-2 border-t border-gray-100"></div>
            <div className="px-3 pb-2 pt-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Blocks</p>
            </div>
          </>
        )}
        {regularItems.map((item: any) => {
          const index = items.indexOf(item);

          return (
            <button
              className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-all rounded-lg mx-1 ${
                index === selectedIndex ? "bg-blue-50/70" : "hover:bg-gray-50"
              }`}
              key={index}
              onClick={() => selectItem(index)}
            >
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                  item.bgColor || "bg-gray-50"
                }`}
              >
                {item.icon && <item.icon className={`h-4 w-4 ${item.color || "text-gray-600"}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${item.color || "text-gray-900"}`}>{item.title}</p>
                <p className="text-xs text-gray-500 truncate">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

CommandList.displayName = "CommandList";

export { Command, getSuggestionItems };
export type { AICommandOptions };
