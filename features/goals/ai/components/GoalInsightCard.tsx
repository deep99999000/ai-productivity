import React from "react";
import { motion } from "framer-motion";
import { Pin, ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { goalTypeConfig } from "../config";
import type { GoalAISuggestion } from "../types";

interface GoalInsightCardProps {
  suggestion: GoalAISuggestion;
  pinned: boolean;
  onPin: () => void;
  onSelect: () => void;
  fadeItem: any;
}

export function GoalInsightCard({ suggestion, pinned, onPin, onSelect, fadeItem }: GoalInsightCardProps) {
  const config = goalTypeConfig[suggestion.type];
  
  return (
    <motion.div
      layout
      variants={fadeItem}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="group relative bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/80 p-3 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer hover:bg-white"
      onClick={onSelect}
    >
      {/* Score indicator */}
      {suggestion.score && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${
            suggestion.score >= 90 ? 'bg-green-500' :
            suggestion.score >= 70 ? 'bg-yellow-500' : 'bg-slate-400'
          }`} />
          <span className="text-xs text-slate-500 font-medium">{suggestion.score}</span>
        </div>
      )}
      
      <div className="flex items-start gap-3 pr-10">
        {/* Type icon */}
        <div className="text-base mt-0.5 flex-shrink-0">
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900 text-sm truncate">
              {suggestion.title}
            </h4>
            {suggestion.priority && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                suggestion.priority === "high" ? "bg-red-100 text-red-700" :
                suggestion.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                "bg-green-100 text-green-700"
              }`}>
                {suggestion.priority}
              </span>
            )}
          </div>
          
          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
            {suggestion.description}
          </p>
          
          {/* Bottom row with time and tags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Estimated time */}
              {suggestion.estimatedTimeToComplete && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500">{suggestion.estimatedTimeToComplete}</span>
                </div>
              )}
              
              {/* Tags */}
              {suggestion.tags && suggestion.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  {suggestion.tags.slice(0, 1).map((tag) => (
                    <span 
                      key={tag}
                      className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {suggestion.tags.length > 1 && (
                    <span className="text-xs text-slate-400">
                      +{suggestion.tags.length - 1}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Type badge */}
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.color} bg-opacity-10 border`} style={{
              color: config.color.replace('text-', ''),
              backgroundColor: `${config.color.replace('text-', '').replace('-600', '-50')}`,
              borderColor: `${config.color.replace('text-', '').replace('-600', '-200')}`
            }}>
              {config.label}
            </span>
          </div>
        </div>
      </div>
      
      {/* Hover actions */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-green-500 rounded-r" />
      )}

      {/* Priority border */}
      {suggestion.priority === "high" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-lg" />
      )}
    </motion.div>
  );
}
