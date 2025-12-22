import React from "react";
import { motion } from "framer-motion";
import { Pin, ExternalLink } from "lucide-react";
import { typeConfig } from "../../utils/config";
import type { AISuggestion } from "../../types";

interface InsightCardProps {
  suggestion: AISuggestion;
  pinned: boolean;
  onPin: () => void;
  onSelect: () => void;
  fadeItem: any;
}

export function InsightCard({ suggestion, pinned, onPin, onSelect, fadeItem }: InsightCardProps) {
  const config = typeConfig[suggestion.type];
  
  return (
    <motion.div
      layout
      variants={fadeItem}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="group relative bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
      onClick={onSelect}
    >
      {/* Score indicator */}
      {suggestion.score && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            suggestion.score >= 90 ? 'bg-green-500' :
            suggestion.score >= 70 ? 'bg-yellow-500' : 'bg-slate-400'
          }`} />
          <span className="text-xs text-slate-500">{suggestion.score}</span>
        </div>
      )}
      
      <div className="flex items-start gap-3 pr-12">
        {/* Type icon */}
        <div className="text-lg mt-0.5">
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900 text-sm truncate">
              {suggestion.title}
            </h4>
           
          </div>
          
          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {suggestion.description}
          </p>
          
          {/* Tags */}
          {suggestion.tags && suggestion.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {suggestion.tags.slice(0, 2).map((tag) => (
                <span 
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {suggestion.tags.length > 2 && (
                <span className="text-xs text-slate-400">
                  +{suggestion.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Hover actions */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            className={`p-1 rounded hover:bg-slate-100 transition-colors ${
              pinned ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <Pin className="h-3 w-3" />
          </button>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </div>
      </div>
      
      {/* Actionable indicator */}
      {suggestion.actionable && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-green-500 rounded-r" />
      )}
    </motion.div>
  );
}