"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import BaseDialog from "@/components/BaseDialog";
import { 
  Target, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Dumbbell, 
  Palette,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2
} from "lucide-react";
import { useGoal } from "@/features/goals/utils/GoalStore";
import { useSubgoal } from "@/features/subGoals/subgoalStore";
import { useTodo } from "@/features/todo/todostore";
import { newGoalsAction, newSubGoalsAction } from "@/features/goals/actions/goalaction";
import { newtodoaction } from "@/features/todo/todoaction";
import { generateUniqueId } from "@/lib/generateUniqueId";
import useUser from "@/store/useUser";
import type { NewGoal } from "@/features/goals/types/goalSchema";
import type { NewSubgoal } from "@/features/subGoals/subGoalschema";
import type { NewTodo } from "@/features/todo/todoSchema";

interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  estimatedDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  subgoals: {
    name: string;
    description: string;
    tasks: string[];
  }[];
}

const goalTemplates: GoalTemplate[] = [
  {
    id: 'career-advancement',
    title: 'Career Advancement',
    description: 'Build skills and advance your professional career',
    category: 'Career',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    estimatedDuration: '6-12 months',
    difficulty: 'Intermediate',
    subgoals: [
      {
        name: 'Skill Development',
        description: 'Enhance technical and soft skills',
        tasks: [
          'Complete online certification course',
          'Attend 2 industry conferences',
          'Join professional networking group',
          'Find mentor in target role'
        ]
      },
      {
        name: 'Portfolio Building',
        description: 'Create showcase of your work',
        tasks: [
          'Update LinkedIn profile',
          'Create personal portfolio website',
          'Document 3 major project achievements',
          'Collect testimonials from colleagues'
        ]
      },
      {
        name: 'Job Search Strategy',
        description: 'Execute targeted job search',
        tasks: [
          'Research target companies',
          'Apply to 20 relevant positions',
          'Practice interview skills',
          'Negotiate job offer'
        ]
      }
    ]
  },
  {
    id: 'fitness-transformation',
    title: 'Fitness Transformation',
    description: 'Complete health and fitness makeover',
    category: 'Health',
    icon: <Dumbbell className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
    estimatedDuration: '3-6 months',
    difficulty: 'Beginner',
    subgoals: [
      {
        name: 'Exercise Routine',
        description: 'Build consistent workout habits',
        tasks: [
          'Join gym or set up home workout space',
          'Create weekly workout schedule',
          'Work out 4x per week for 8 weeks',
          'Track progress with measurements'
        ]
      },
      {
        name: 'Nutrition Plan',
        description: 'Develop healthy eating habits',
        tasks: [
          'Consult with nutritionist',
          'Meal prep for 2 weeks',
          'Track daily calorie intake',
          'Eliminate processed foods'
        ]
      },
      {
        name: 'Lifestyle Changes',
        description: 'Support overall wellness',
        tasks: [
          'Get 8 hours sleep nightly',
          'Drink 8 glasses water daily',
          'Take progress photos monthly',
          'Celebrate milestone achievements'
        ]
      }
    ]
  },
  {
    id: 'learn-new-skill',
    title: 'Master New Skill',
    description: 'Learn and master a completely new skill',
    category: 'Learning',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    estimatedDuration: '2-4 months',
    difficulty: 'Beginner',
    subgoals: [
      {
        name: 'Foundation Learning',
        description: 'Build basic understanding',
        tasks: [
          'Research learning resources',
          'Complete beginner course',
          'Practice 30 minutes daily',
          'Join online community'
        ]
      },
      {
        name: 'Practical Application',
        description: 'Apply knowledge in real projects',
        tasks: [
          'Complete 3 practice projects',
          'Get feedback from experts',
          'Document learning progress',
          'Teach someone else basics'
        ]
      },
      {
        name: 'Mastery & Recognition',
        description: 'Achieve proficiency level',
        tasks: [
          'Complete advanced course',
          'Create portfolio piece',
          'Get certified if applicable',
          'Share knowledge publicly'
        ]
      }
    ]
  },
  {
    id: 'side-business',
    title: 'Launch Side Business',
    description: 'Start and grow a profitable side business',
    category: 'Business',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
    estimatedDuration: '6-12 months',
    difficulty: 'Advanced',
    subgoals: [
      {
        name: 'Business Planning',
        description: 'Plan and validate business idea',
        tasks: [
          'Conduct market research',
          'Create business plan',
          'Validate idea with potential customers',
          'Set up legal structure'
        ]
      },
      {
        name: 'Product Development',
        description: 'Build minimum viable product',
        tasks: [
          'Design product/service',
          'Build MVP version',
          'Test with beta users',
          'Iterate based on feedback'
        ]
      },
      {
        name: 'Launch & Growth',
        description: 'Bring product to market',
        tasks: [
          'Create marketing strategy',
          'Launch to public',
          'Acquire first 100 customers',
          'Achieve profitability'
        ]
      }
    ]
  },
  {
    id: 'creative-project',
    title: 'Complete Creative Project',
    description: 'Finish a major creative endeavor',
    category: 'Creative',
    icon: <Palette className="w-6 h-6" />,
    color: 'from-pink-500 to-pink-600',
    estimatedDuration: '3-6 months',
    difficulty: 'Intermediate',
    subgoals: [
      {
        name: 'Concept Development',
        description: 'Plan and design project',
        tasks: [
          'Brainstorm ideas and themes',
          'Create detailed concept',
          'Gather inspiration and references',
          'Plan project timeline'
        ]
      },
      {
        name: 'Creation Process',
        description: 'Execute the creative work',
        tasks: [
          'Set up workspace/tools',
          'Create first draft/prototype',
          'Iterate and refine work',
          'Get feedback from others'
        ]
      },
      {
        name: 'Completion & Sharing',
        description: 'Finalize and showcase work',
        tasks: [
          'Polish final version',
          'Create presentation/portfolio',
          'Share with target audience',
          'Gather testimonials/reviews'
        ]
      }
    ]
  },
  {
    id: 'relationship-goals',
    title: 'Strengthen Relationships',
    description: 'Improve personal and professional relationships',
    category: 'Relationships',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-red-500 to-red-600',
    estimatedDuration: '3-6 months',
    difficulty: 'Intermediate',
    subgoals: [
      {
        name: 'Personal Relationships',
        description: 'Strengthen family and friendships',
        tasks: [
          'Schedule regular family time',
          'Plan monthly friend gatherings',
          'Practice active listening',
          'Express gratitude regularly'
        ]
      },
      {
        name: 'Professional Network',
        description: 'Build professional connections',
        tasks: [
          'Attend networking events',
          'Connect with 50 new people',
          'Offer help to colleagues',
          'Maintain regular contact'
        ]
      },
      {
        name: 'Communication Skills',
        description: 'Improve interpersonal skills',
        tasks: [
          'Take communication course',
          'Practice empathetic listening',
          'Learn conflict resolution',
          'Give constructive feedback'
        ]
      }
    ]
  }
];

interface GoalTemplateLibraryProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const GoalTemplateLibrary: React.FC<GoalTemplateLibraryProps> = ({ isOpen, setIsOpen }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<string>('All');
  
  const { addGoal } = useGoal();
  const { addSubgoal } = useSubgoal();
  const { addTodo } = useTodo();
  const { user } = useUser();

  const categories = ['All', ...Array.from(new Set(goalTemplates.map(t => t.category)))];
  const filteredTemplates = filter === 'All' 
    ? goalTemplates 
    : goalTemplates.filter(t => t.category === filter);

  const createGoalFromTemplate = async (template: GoalTemplate) => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      const goalId = generateUniqueId();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // Default 6 months

      // Create main goal
      const newGoal: NewGoal = {
        id: goalId,
        name: template.title,
        description: template.description,
        user_id: user,
        status: "Not Started",
        category: template.category,
        endDate: endDate
      };

      addGoal(newGoal);
      await newGoalsAction(newGoal);

      // Create subgoals and tasks
      for (const subgoalTemplate of template.subgoals) {
        const subgoalId = generateUniqueId();
        const subgoalEndDate = new Date();
        subgoalEndDate.setMonth(subgoalEndDate.getMonth() + 2);

        const newSubgoal: NewSubgoal = {
          id: subgoalId,
          name: subgoalTemplate.name,
          description: subgoalTemplate.description,
          status: "Not Started",
          user_id: user,
          goal_id: goalId,
          endDate: subgoalEndDate
        };

        addSubgoal(newSubgoal, user, goalId, subgoalId);
        await newSubGoalsAction(newSubgoal);

        // Create tasks for this subgoal
        for (const taskName of subgoalTemplate.tasks) {
          const taskEndDate = new Date();
          taskEndDate.setDate(taskEndDate.getDate() + 14); // 2 weeks from now

          const newTask: NewTodo = {
            name: taskName,
            description: `Task for ${subgoalTemplate.name}`,
            user_id: user,
            isDone: false,
            category: template.category,
            priority: 'medium',
            endDate: taskEndDate,
            goal_id: goalId,
            subgoal_id: subgoalId,
            goalName: template.title,
            subgoalName: subgoalTemplate.name
          };

          addTodo(newTask, user);
          await newtodoaction(newTask);
        }
      }

      setIsOpen(false);
      setSelectedTemplate(null);
      
    } catch (error) {
      console.error('Failed to create goal from template:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      setisOpen={setIsOpen}
      title=""
      description=""
    >
      <div className="max-w-6xl mx-auto">
        {!selectedTemplate ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Goal Template Library</h2>
              <p className="text-gray-600 text-lg">
                Jump-start your goals with proven templates and frameworks
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={filter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto">
              {filteredTemplates.map(template => (
                <Card
                  key={template.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${template.color} text-white`}>
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{template.title}</h3>
                        <Badge variant="secondary" className="mt-1">{template.category}</Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {template.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{template.estimatedDuration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>{template.difficulty} level</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{template.subgoals.length} milestones included</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Template Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ← Back to Templates
                </Button>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${selectedTemplate.color} text-white`}>
                  {selectedTemplate.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.title}</h2>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>
              </div>

              {/* Template Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">Duration</div>
                  <div className="text-sm text-gray-600">{selectedTemplate.estimatedDuration}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">Difficulty</div>
                  <div className="text-sm text-gray-600">{selectedTemplate.difficulty}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">Milestones</div>
                  <div className="text-sm text-gray-600">{selectedTemplate.subgoals.length} included</div>
                </div>
              </div>

              {/* Subgoals Preview */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">What's Included</h3>
                {selectedTemplate.subgoals.map((subgoal, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{subgoal.name}</h4>
                          <p className="text-sm text-gray-600">{subgoal.description}</p>
                        </div>
                      </div>
                      <div className="ml-11">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Tasks ({subgoal.tasks.length}):
                        </div>
                        <ul className="space-y-1">
                          {subgoal.tasks.map((task, taskIndex) => (
                            <li key={taskIndex} className="text-sm text-gray-600 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => createGoalFromTemplate(selectedTemplate)}
                  disabled={isCreating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isCreating ? (
                    <>Creating Goal...</>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Goal from Template
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Customize First
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </BaseDialog>
  );
};

export default GoalTemplateLibrary;
