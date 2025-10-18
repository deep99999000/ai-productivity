"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BaseDialog from "@/components/BaseDialog";
import { 
  Plus, 
  ArrowRight, 
  GitBranch, 
  AlertTriangle, 
  CheckCircle2,
  X,
  Link2,
  Target,
  Clock
} from "lucide-react";
import { useGoal } from "@/features/goals/utils/GoalStore";
import type { Goal } from "@/features/goals/types/goalSchema";

export interface GoalDependency {
  id: string;
  sourceGoalId: number;
  targetGoalId: number;
  type: 'blocks' | 'enables' | 'relates_to' | 'follows';
  description?: string;
  createdAt: Date;
}

interface GoalRelationshipManagerProps {
  currentGoal: Goal;
}

const GoalRelationshipManager: React.FC<GoalRelationshipManagerProps> = ({ currentGoal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [relationshipType, setRelationshipType] = useState<GoalDependency['type']>('relates_to');
  const [dependencies, setDependencies] = useState<GoalDependency[]>([
    // Mock data - in real app, this would come from a store/API
    {
      id: '1',
      sourceGoalId: currentGoal.id,
      targetGoalId: 999, // Mock ID
      type: 'blocks',
      description: 'Cannot start until foundation is complete',
      createdAt: new Date()
    }
  ]);
  
  const { allGoals } = useGoal();
  const otherGoals = allGoals.filter(g => g.id !== currentGoal.id);

  const relationshipTypes = [
    { 
      value: 'blocks' as const, 
      label: 'Blocks', 
      description: 'This goal blocks the selected goal',
      color: 'bg-red-100 text-red-800',
      icon: <X className="w-4 h-4" />
    },
    { 
      value: 'enables' as const, 
      label: 'Enables', 
      description: 'This goal enables the selected goal',
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle2 className="w-4 h-4" />
    },
    { 
      value: 'relates_to' as const, 
      label: 'Related To', 
      description: 'This goal is related to the selected goal',
      color: 'bg-blue-100 text-blue-800',
      icon: <Link2 className="w-4 h-4" />
    },
    { 
      value: 'follows' as const, 
      label: 'Follows', 
      description: 'This goal should be completed after the selected goal',
      color: 'bg-purple-100 text-purple-800',
      icon: <ArrowRight className="w-4 h-4" />
    }
  ];

  const addDependency = () => {
    if (!selectedGoal) return;

    const newDependency: GoalDependency = {
      id: Date.now().toString(),
      sourceGoalId: currentGoal.id,
      targetGoalId: selectedGoal.id,
      type: relationshipType,
      createdAt: new Date()
    };

    setDependencies(prev => [...prev, newDependency]);
    setSelectedGoal(null);
    setIsOpen(false);
  };

  const removeDependency = (dependencyId: string) => {
    setDependencies(prev => prev.filter(d => d.id !== dependencyId));
  };

  const getRelatedGoals = useMemo(() => {
    return dependencies.map(dep => {
      const relatedGoal = allGoals.find(g => g.id === dep.targetGoalId);
      const relationshipInfo = relationshipTypes.find(rt => rt.value === dep.type);
      
      return {
        dependency: dep,
        goal: relatedGoal,
        relationshipInfo
      };
    }).filter(item => item.goal); // Filter out goals that don't exist
  }, [dependencies, allGoals, relationshipTypes]);

  const getDependencyChain = (goalId: number, visited = new Set<number>()): Goal[] => {
    if (visited.has(goalId)) return []; // Prevent circular dependencies
    
    visited.add(goalId);
    const chain: Goal[] = [];
    
    // Find goals that this goal depends on
    const blockingDeps = dependencies.filter(d => 
      d.targetGoalId === goalId && (d.type === 'blocks' || d.type === 'follows')
    );
    
    blockingDeps.forEach(dep => {
      const blockingGoal = allGoals.find(g => g.id === dep.sourceGoalId);
      if (blockingGoal) {
        chain.push(blockingGoal);
        chain.push(...getDependencyChain(blockingGoal.id, visited));
      }
    });
    
    return chain;
  };

  const getRiskAssessment = () => {
    const risks: string[] = [];
    const blockedGoals = getRelatedGoals.filter(rg => rg.dependency.type === 'blocks');
    const followGoals = getRelatedGoals.filter(rg => rg.dependency.type === 'follows');
    
    if (blockedGoals.length > 0) {
      risks.push(`Blocking ${blockedGoals.length} goal${blockedGoals.length !== 1 ? 's' : ''}`);
    }
    
    if (currentGoal.status === 'Not Started' && followGoals.length > 0) {
      const incompletePrereqs = followGoals.filter(fg => 
        fg.goal && fg.goal.status !== 'Completed'
      );
      if (incompletePrereqs.length > 0) {
        risks.push(`Waiting for ${incompletePrereqs.length} prerequisite${incompletePrereqs.length !== 1 ? 's' : ''}`);
      }
    }
    
    return risks;
  };

  const risks = getRiskAssessment();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Goal Relationships</h3>
              <p className="text-sm text-gray-600">Manage dependencies and connections</p>
            </div>
          </div>
          <Button onClick={() => setIsOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Relationship
          </Button>
        </div>

        {/* Risk Assessment */}
        {risks.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Dependency Risks</span>
            </div>
            <ul className="text-sm text-amber-700 space-y-1">
              {risks.map((risk, index) => (
                <li key={index}>• {risk}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Goals */}
        <div className="space-y-3">
          {getRelatedGoals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No goal relationships defined yet.</p>
              <p className="text-sm">Add connections to track dependencies and related goals.</p>
            </div>
          ) : (
            getRelatedGoals.map(({ dependency, goal, relationshipInfo }) => (
              <div key={dependency.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className={`p-2 rounded-full ${relationshipInfo?.color}`}>
                  {relationshipInfo?.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{goal?.name}</span>
                    <Badge className={relationshipInfo?.color}>
                      {relationshipInfo?.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {goal?.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{relationshipInfo?.description}</p>
                  {dependency.description && (
                    <p className="text-sm text-gray-500 italic mt-1">{dependency.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500">
                    {goal?.endDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(goal.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDependency(dependency.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dependency Chain Visualization */}
        {getRelatedGoals.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Impact Analysis
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• This goal is connected to {getRelatedGoals.length} other goal{getRelatedGoals.length !== 1 ? 's' : ''}</p>
              <p>• {getRelatedGoals.filter(rg => rg.dependency.type === 'blocks').length} goal{getRelatedGoals.filter(rg => rg.dependency.type === 'blocks').length !== 1 ? 's are' : ' is'} waiting on this completion</p>
              <p>• {getRelatedGoals.filter(rg => rg.dependency.type === 'enables').length} goal{getRelatedGoals.filter(rg => rg.dependency.type === 'enables').length !== 1 ? 's will be' : ' will be'} enabled by this completion</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Relationship Dialog */}
      <BaseDialog
        isOpen={isOpen}
        setisOpen={setIsOpen}
        title="Add Goal Relationship"
        description="Define how this goal relates to other goals"
      >
        <div className="space-y-6">
          {/* Relationship Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Relationship Type</label>
            <div className="grid grid-cols-2 gap-3">
              {relationshipTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setRelationshipType(type.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    relationshipType === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {type.icon}
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Select Goal</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {otherGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    selectedGoal?.id === goal.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{goal.name}</div>
                      <div className="text-sm text-gray-600">{goal.category}</div>
                    </div>
                    <Badge variant="outline">{goal.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={addDependency}
              disabled={!selectedGoal}
              className="flex-1"
            >
              Add Relationship
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </BaseDialog>
    </Card>
  );
};

export default GoalRelationshipManager;
