"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import BaseDialog from "@/components/BaseDialog";
import { 
  Plus, 
  Zap, 
  Play, 
  Pause, 
  Settings, 
  Calendar, 
  Bell, 
  Repeat,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'deadline_approaching' | 'task_completed' | 'goal_stalled' | 'schedule' | 'priority_change';
    config: Record<string, any>;
  };
  actions: {
    type: 'create_task' | 'send_reminder' | 'update_priority' | 'assign_resource' | 'schedule_review';
    config: Record<string, any>;
  }[];
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

interface GoalAutomationProps {
  goalId: number;
  goalName: string;
}

const GoalAutomation: React.FC<GoalAutomationProps> = ({ goalId, goalName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [automations, setAutomations] = useState<AutomationRule[]>([
    // Mock data - in real app would come from backend
    {
      id: '1',
      name: 'Daily Progress Reminder',
      description: 'Send reminder if no progress made today',
      trigger: {
        type: 'schedule',
        config: { time: '18:00', frequency: 'daily' }
      },
      actions: [
        {
          type: 'send_reminder',
          config: { message: 'Remember to work on your goal today!' }
        }
      ],
      isActive: true,
      lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Deadline Alert System',
      description: 'Create high-priority review task when deadline approaches',
      trigger: {
        type: 'deadline_approaching',
        config: { daysBefore: 3 }
      },
      actions: [
        {
          type: 'create_task',
          config: { 
            name: 'Review goal progress and adjust timeline',
            priority: 'high'
          }
        },
        {
          type: 'send_reminder',
          config: { message: 'Goal deadline approaching - review needed!' }
        }
      ],
      isActive: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const automationTemplates = [
    {
      id: 'progress-tracker',
      name: 'Progress Tracker',
      description: 'Automatically track and remind about daily progress',
      triggers: ['schedule'],
      actions: ['send_reminder', 'create_task']
    },
    {
      id: 'deadline-manager',
      name: 'Deadline Manager',
      description: 'Manage approaching deadlines and create review tasks',
      triggers: ['deadline_approaching'],
      actions: ['create_task', 'send_reminder', 'update_priority']
    },
    {
      id: 'milestone-celebration',
      name: 'Milestone Celebration',
      description: 'Celebrate completed milestones and plan next steps',
      triggers: ['task_completed'],
      actions: ['send_reminder', 'create_task']
    },
    {
      id: 'stall-detector',
      name: 'Stall Detector',
      description: 'Detect when goals are stalling and suggest actions',
      triggers: ['goal_stalled'],
      actions: ['create_task', 'schedule_review', 'send_reminder']
    }
  ];

  const triggerTypes = {
    'deadline_approaching': {
      name: 'Deadline Approaching',
      icon: <Calendar className="w-4 h-4" />,
      color: 'bg-orange-100 text-orange-800'
    },
    'task_completed': {
      name: 'Task Completed',
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'bg-green-100 text-green-800'
    },
    'goal_stalled': {
      name: 'Goal Stalled',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'bg-red-100 text-red-800'
    },
    'schedule': {
      name: 'Scheduled',
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800'
    },
    'priority_change': {
      name: 'Priority Change',
      icon: <Target className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-800'
    }
  };

  const actionTypes = {
    'create_task': {
      name: 'Create Task',
      icon: <Plus className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800'
    },
    'send_reminder': {
      name: 'Send Reminder',
      icon: <Bell className="w-4 h-4" />,
      color: 'bg-yellow-100 text-yellow-800'
    },
    'update_priority': {
      name: 'Update Priority',
      icon: <Target className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-800'
    },
    'assign_resource': {
      name: 'Assign Resource',
      icon: <Settings className="w-4 h-4" />,
      color: 'bg-gray-100 text-gray-800'
    },
    'schedule_review': {
      name: 'Schedule Review',
      icon: <Calendar className="w-4 h-4" />,
      color: 'bg-indigo-100 text-indigo-800'
    }
  };

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(automation => 
      automation.id === id 
        ? { ...automation, isActive: !automation.isActive }
        : automation
    ));
  };

  const createAutomationFromTemplate = (templateId: string) => {
    const template = automationTemplates.find(t => t.id === templateId);
    if (!template) return;

    // This would open a configuration dialog in a real app
    const newAutomation: AutomationRule = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      trigger: {
        type: 'schedule',
        config: { time: '09:00', frequency: 'daily' }
      },
      actions: [
        {
          type: 'send_reminder',
          config: { message: 'Automated reminder from ' + template.name }
        }
      ],
      isActive: true,
      createdAt: new Date()
    };

    setAutomations(prev => [...prev, newAutomation]);
    setIsOpen(false);
  };

  const formatLastTriggered = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Goal Automation</h3>
              <p className="text-sm text-gray-600">Streamline your goal management with smart workflows</p>
            </div>
          </div>
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Automation
          </Button>
        </div>

        {/* Active Automations */}
        <div className="space-y-4">
          {automations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No automations configured yet.</p>
              <p className="text-sm">Add smart workflows to streamline your goal management.</p>
            </div>
          ) : (
            automations.map(automation => (
              <div key={automation.id} className="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{automation.name}</h4>
                        <Badge 
                          className={automation.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {automation.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <Switch
                        checked={automation.isActive}
                        onCheckedChange={() => toggleAutomation(automation.id)}
                      />
                    </div>

                    <p className="text-sm text-gray-600">{automation.description}</p>

                    {/* Trigger and Actions */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Trigger:</span>
                        <Badge className={triggerTypes[automation.trigger.type]?.color}>
                          {triggerTypes[automation.trigger.type]?.icon}
                          <span className="ml-1">{triggerTypes[automation.trigger.type]?.name}</span>
                        </Badge>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Actions:</span>
                        <div className="flex gap-1">
                          {automation.actions.map((action, index) => (
                            <Badge key={index} className={actionTypes[action.type]?.color}>
                              {actionTypes[action.type]?.icon}
                              <span className="ml-1">{actionTypes[action.type]?.name}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Last Triggered */}
                    <div className="text-xs text-gray-500">
                      Last triggered: {formatLastTriggered(automation.lastTriggered)}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleAutomation(automation.id)}
                    >
                      {automation.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{automations.filter(a => a.isActive).length}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{automations.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {automations.filter(a => a.lastTriggered).length}
            </div>
            <div className="text-sm text-gray-600">Triggered</div>
          </div>
        </div>
      </div>

      {/* Add Automation Dialog */}
      <BaseDialog
        isOpen={isOpen}
        setisOpen={setIsOpen}
        title="Add Goal Automation"
        description="Choose a template to get started with automation"
      >
        <div className="space-y-6">
          {/* Templates */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Automation Templates</h4>
            <div className="grid gap-3">
              {automationTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-900">{template.name}</h5>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.triggers.length} trigger{template.triggers.length !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.actions.length} action{template.actions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => selectedTemplate && createAutomationFromTemplate(selectedTemplate)}
              disabled={!selectedTemplate}
              className="flex-1"
            >
              Create Automation
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </BaseDialog>
    </Card>
  );
};

export default GoalAutomation;
