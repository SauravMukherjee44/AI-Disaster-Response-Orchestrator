'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Ambulance,
  Radio,
  Package,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { PriorityAction } from '@/lib/supabase';
import { ActionDetailSheet } from './action-detail-sheet';

interface ActionListProps {
  actions: PriorityAction[];
  onUpdate?: () => void;
}

const actionIcons = {
  rescue: Users,
  medical: Ambulance,
  logistics: Package,
  communication: Radio,
};

const actionColors = {
  rescue: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', gradient: 'from-red-50 to-red-100' },
  medical: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-50 to-blue-100' },
  logistics: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', gradient: 'from-green-50 to-green-100' },
  communication: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-50 to-purple-100' },
};

const statusColors = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  completed: { bg: 'bg-green-100', text: 'text-green-700', icon: TrendingUp },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
};

function getPriorityColor(score: number) {
  if (score >= 80) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
  if (score >= 60) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
  if (score >= 40) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
  return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
}

export function ActionList({ actions, onUpdate }: ActionListProps) {
  const [selectedAction, setSelectedAction] = useState<PriorityAction | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sortedActions = [...actions].sort((a, b) => b.priority_score - a.priority_score);

  const handleActionClick = (action: PriorityAction) => {
    setSelectedAction(action);
    setSheetOpen(true);
  };

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <div className="space-y-3">
        {sortedActions.map((action, index) => {
          const Icon = actionIcons[action.action_type] || Users;
          const colors = actionColors[action.action_type] || actionColors.rescue;
          const statusColor = statusColors[action.status];
          const priorityColor = getPriorityColor(action.priority_score);
          const StatusIcon = statusColor.icon;

          return (
            <Card
              key={action.id}
              className="border-2 card-hover cursor-pointer group animate-slide-up overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleActionClick(action)}
            >
              <CardContent className="p-0">
                <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border-2 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs font-medium">
                              {action.action_type.toUpperCase()}
                            </Badge>
                            <Badge className={`text-xs ${statusColor.bg} ${statusColor.text} border-0`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {action.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm leading-tight group-hover:text-blue-600 transition-colors">
                            {action.description}
                          </h4>
                        </div>

                        <div className={`flex flex-col items-center justify-center p-3 rounded-xl ${priorityColor.bg} ${priorityColor.border} border-2 min-w-[80px]`}>
                          <TrendingUp className={`h-5 w-5 ${priorityColor.text} mb-1`} />
                          <span className={`text-2xl font-bold ${priorityColor.text}`}>
                            {action.priority_score}
                          </span>
                          <span className="text-xs text-gray-500">priority</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span className="font-medium">{action.estimated_impact.toLocaleString()}</span>
                            <span className="text-gray-500">impact</span>
                          </div>

                          {action.deadline && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="font-medium">
                                {new Date(action.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <Button variant="ghost" size="sm" className="group-hover:bg-blue-50">
                          <span className="text-xs mr-1">Manage</span>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {sortedActions.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No priority actions yet</p>
              <p className="text-sm text-gray-400 mt-1">Actions will appear here when disasters are reported</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ActionDetailSheet
        action={selectedAction}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdate={handleUpdate}
      />
    </>
  );
}
