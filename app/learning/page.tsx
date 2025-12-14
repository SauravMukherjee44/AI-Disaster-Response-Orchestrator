'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase, PriorityAction, Disaster } from '@/lib/supabase';
import { TrendingUp, Brain, Award, BarChart3, Zap, Target, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function LearningPage() {
  const [actions, setActions] = useState<(PriorityAction & { disasters: Disaster })[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('priority_actions')
        .select(`
          *,
          disasters (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActions(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch learning data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const actionsChannel = supabase
      .channel('learning-realtime-actions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'priority_actions' }, () => {
        fetchData();
      })
      .subscribe();

    const trainingChannel = supabase
      .channel('learning-realtime-training')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rl_training_data' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(actionsChannel);
      supabase.removeChannel(trainingChannel);
    };
  }, []);

  const completedActions = actions.filter(a => a.status === 'completed');
  const totalImpact = completedActions.reduce((sum, a) => sum + (a.estimated_impact || 0), 0);
  const avgPriorityScore = actions.length > 0
    ? actions.reduce((sum, a) => sum + (a.priority_score || 0), 0) / actions.length
    : 0;
  const avgAllocationScore = actions.filter(a => a.allocation_score).length > 0
    ? actions.filter(a => a.allocation_score).reduce((sum, a) => sum + (a.allocation_score || 0), 0) / actions.filter(a => a.allocation_score).length
    : 0;

  const actionsByType = {
    rescue: actions.filter(a => a.action_type === 'rescue'),
    medical: actions.filter(a => a.action_type === 'medical'),
    logistics: actions.filter(a => a.action_type === 'logistics'),
  };

  const successRate = actions.length > 0
    ? (completedActions.length / actions.length) * 100
    : 0;

  const topPerformingActions = [...actions]
    .filter(a => a.allocation_score)
    .sort((a, b) => (b.allocation_score || 0) - (a.allocation_score || 0))
    .slice(0, 5);

  const handleTrainRL = async () => {
    setTraining(true);
    try {
      const response = await fetch('/api/rl-train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodes: 1000 }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Training failed');
      }

      toast.success(`RL training completed! Avg reward: ${data.avg_reward.toFixed(1)}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to train RL model');
    } finally {
      setTraining(false);
    }
  };

  const learningInsights = [
    {
      title: 'Resource Optimization',
      description: 'RL algorithms continuously learn optimal resource allocation patterns based on disaster type, severity, and historical outcomes.',
      metric: `${avgAllocationScore.toFixed(2)} avg score`,
      icon: Target,
      color: 'text-blue-400'
    },
    {
      title: 'Priority Refinement',
      description: 'Machine learning models improve priority scoring accuracy by analyzing completed actions and their real-world impact.',
      metric: `${avgPriorityScore.toFixed(1)} avg priority`,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: 'Action Success Rate',
      description: 'System tracks completion rates and adjusts future recommendations to maximize successful outcomes.',
      metric: `${successRate.toFixed(0)}% success`,
      icon: Award,
      color: 'text-yellow-400'
    },
    {
      title: 'Adaptive Response',
      description: 'RL agents learn from each disaster event, improving response strategies for similar future scenarios.',
      metric: `${actions.length} training samples`,
      icon: Brain,
      color: 'text-purple-400'
    },
  ];

  const typePerformance = [
    {
      type: 'Rescue Operations',
      icon: '🚁',
      total: actionsByType.rescue.length,
      completed: actionsByType.rescue.filter(a => a.status === 'completed').length,
      avgScore: actionsByType.rescue.length > 0
        ? actionsByType.rescue.reduce((sum, a) => sum + (a.allocation_score || 0), 0) / actionsByType.rescue.length
        : 0,
      color: 'bg-red-600'
    },
    {
      type: 'Medical Response',
      icon: '⚕️',
      total: actionsByType.medical.length,
      completed: actionsByType.medical.filter(a => a.status === 'completed').length,
      avgScore: actionsByType.medical.length > 0
        ? actionsByType.medical.reduce((sum, a) => sum + (a.allocation_score || 0), 0) / actionsByType.medical.length
        : 0,
      color: 'bg-blue-600'
    },
    {
      type: 'Logistics Support',
      icon: '📦',
      total: actionsByType.logistics.length,
      completed: actionsByType.logistics.filter(a => a.status === 'completed').length,
      avgScore: actionsByType.logistics.length > 0
        ? actionsByType.logistics.reduce((sum, a) => sum + (a.allocation_score || 0), 0) / actionsByType.logistics.length
        : 0,
      color: 'bg-green-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation onRefresh={fetchData} loading={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-400 animate-pulse" />
              Reinforcement Learning Insights
            </h2>
            <p className="text-slate-400 mt-1">System improvements and optimization through Oumi RL</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleTrainRL}
              disabled={training}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {training ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Training RL Model...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Train RL Model
                </>
              )}
            </Button>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm">
              <Activity className="h-4 w-4 mr-2 inline animate-pulse" />
              Active Learning
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/90 border-blue-700/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-white">{actions.length}</div>
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-sm font-medium text-slate-200">Total Training Actions</div>
              <div className="mt-2 text-xs text-slate-400">Used for RL optimization</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-green-700/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-white">{completedActions.length}</div>
                <Award className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-sm font-medium text-slate-200">Completed Actions</div>
              <div className="mt-2 text-xs text-green-400 font-medium">{successRate.toFixed(0)}% success rate</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-purple-700/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-white">{avgAllocationScore.toFixed(2)}</div>
                <Target className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-sm font-medium text-slate-200">Avg RL Score</div>
              <div className="mt-2 text-xs text-slate-400">Allocation efficiency</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-yellow-700/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-white">{totalImpact.toLocaleString()}</div>
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="text-sm font-medium text-slate-200">People Helped</div>
              <div className="mt-2 text-xs text-slate-400">Cumulative impact</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Learning Mechanisms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningInsights.map((insight, idx) => {
                const Icon = insight.icon;
                return (
                  <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 ${insight.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                        <p className="text-slate-400 text-sm mb-2 leading-relaxed">
                          {insight.description}
                        </p>
                        <Badge className="bg-slate-800 text-slate-300 text-xs">
                          {insight.metric}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Performance by Action Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {typePerformance.map((perf, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${perf.color} flex items-center justify-center text-xl`}>
                        {perf.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{perf.type}</h4>
                        <p className="text-slate-400 text-xs">
                          {perf.completed} / {perf.total} completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-400">{perf.avgScore.toFixed(2)}</div>
                      <div className="text-xs text-slate-400">RL Score</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`${perf.color} h-2 rounded-full transition-all`}
                      style={{ width: `${perf.total > 0 ? (perf.completed / perf.total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {perf.total > 0 ? ((perf.completed / perf.total) * 100).toFixed(0) : 0}% completion rate
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Top Performing Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformingActions.map((action, idx) => (
                <div key={action.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-blue-700/50 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4 className="text-white font-medium mb-1">{action.description}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-700 text-slate-300 text-xs">
                              {action.disasters.title}
                            </Badge>
                            <Badge className="bg-blue-600 text-white text-xs capitalize">
                              {action.action_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-blue-400">
                            {action.allocation_score?.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-400">RL Score</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-slate-400 text-xs">Priority</div>
                          <div className="text-white font-semibold">{action.priority_score || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs">Impact</div>
                          <div className="text-white font-semibold">
                            {action.estimated_impact?.toLocaleString() || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs">Status</div>
                          <div className="text-white font-semibold capitalize">{action.status}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {topPerformingActions.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No RL-optimized actions yet</p>
                  <p className="text-sm mt-2">Actions will appear here once RL scoring is applied</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 border-slate-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              How RL Optimization Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Data Collection</h4>
                <p className="text-sm text-slate-200">
                  System collects data from every disaster event, including actions taken, resources used, and outcomes achieved.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Reward Modeling</h4>
                <p className="text-sm text-slate-200">
                  Oumi RL algorithms assign rewards based on action effectiveness, calculating scores from impact, efficiency, and success metrics.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Policy Optimization</h4>
                <p className="text-sm text-slate-200">
                  The system learns optimal decision policies, improving resource allocation and priority scoring for future disasters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Continuous Improvement</h4>
                <p className="text-sm text-slate-200">
                  With each completed action, the RL model refines its predictions, creating increasingly effective response strategies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
