"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Share2, 
  RefreshCw, 
  Settings, 
  MoreVertical,
  FileText,
  Camera,
  Mail
} from "lucide-react";

interface AnalyticsFloatingActionsProps {
  onExportJSON: () => void;
  onExportCSV: () => void;
  onShare: () => void;
  onRefresh: () => void;
  onSettings?: () => void;
}

export const AnalyticsFloatingActions: React.FC<AnalyticsFloatingActionsProps> = ({
  onExportJSON,
  onExportCSV,
  onShare,
  onRefresh,
  onSettings
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Download, label: "Export JSON", onClick: onExportJSON, color: "bg-blue-500 hover:bg-blue-600" },
    { icon: FileText, label: "Export CSV", onClick: onExportCSV, color: "bg-green-500 hover:bg-green-600" },
    { icon: Share2, label: "Share", onClick: onShare, color: "bg-purple-500 hover:bg-purple-600" },
    { icon: RefreshCw, label: "Refresh", onClick: onRefresh, color: "bg-orange-500 hover:bg-orange-600" },
    ...(onSettings ? [{ icon: Settings, label: "Settings", onClick: onSettings, color: "bg-gray-500 hover:bg-gray-600" }] : [])
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-4"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-sm font-medium text-slate-700 bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200">
                  {action.label}
                </span>
                <Button
                  size="sm"
                  className={`w-12 h-12 rounded-full shadow-lg ${action.color} text-white hover:scale-105 transition-all duration-200`}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                >
                  <action.icon className="w-5 h-5" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <MoreVertical className="w-6 h-6" />
        </motion.div>
      </Button>
    </div>
  );
};

export default AnalyticsFloatingActions;
