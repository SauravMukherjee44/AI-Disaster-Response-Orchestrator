'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, PriorityAction, Disaster } from '@/lib/supabase';
import { CheckSquare, Clock, Users, AlertCircle, Target, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ActionsPage() {
  const [actions, setActions] = useState<(PriorityAction & { disasters: Disaster })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'deadline'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchActions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('priority_actions')
        .select(`
          *,
          disasters (*)
        `)
        .order('priority_score', { ascending: false });

      if (error) throw error;
      setActions(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch actions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();

    const channel = supabase
      .channel('actions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'priority_actions' }, () => {
        fetchActions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateActionStatus = async (actionId: string, newStatus: string) => {
    try {
      const action = actions.find(a => a.id === actionId);

      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('priority_actions')
        .update(updates)
        .eq('id', actionId);

      if (error) throw error;

      if (newStatus === 'completed' && action) {
        const { error: trainingError } = await supabase
          .from('rl_training_data')
          .insert({
            action_id: actionId,
            disaster_id: action.disaster_id,
            action_type: action.action_type,
            success: true,
            completion_time: new Date().toISOString(),
            initial_priority_score: action.priority_score || 0,
            final_priority_score: action.priority_score || 0,
            actual_impact: action.estimated_impact || 0,
            estimated_impact: action.estimated_impact || 0,
            reward_score: (action.priority_score || 0) * 0.1,
            metadata: {
              status: newStatus,
              deadline: action.deadline,
              resources: action.assigned_resources,
            },
          });

        if (trainingError) {
          console.error('Failed to save training data:', trainingError);
        }
      }

      toast.success('Action status updated');
      fetchActions();
    } catch (error: any) {
      toast.error('Failed to update action');
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white border-green-700';
      case 'in_progress': return 'bg-blue-600 text-white border-blue-700';
      case 'pending': return 'bg-yellow-700 text-white border-yellow-800';
      case 'cancelled': return 'bg-gray-700 text-white border-gray-800';
      default: return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rescue': return '🚁';
      case 'medical': return '⚕️';
      case 'logistics': return '📦';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rescue': return 'bg-red-600 text-white';
      case 'medical': return 'bg-blue-600 text-white';
      case 'logistics': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const filteredActions = actions
    .filter(action => filterType === 'all' || action.action_type === filterType)
    .filter(action => filterStatus === 'all' || action.status === filterStatus)
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'priority':
          comparison = (a.priority_score || 0) - (b.priority_score || 0);
          break;
        case 'impact':
          comparison = (a.estimated_impact || 0) - (b.estimated_impact || 0);
          break;
        case 'deadline':
          comparison = new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const stats = {
    total: actions.length,
    pending: actions.filter(a => a.status === 'pending').length,
    inProgress: actions.filter(a => a.status === 'in_progress').length,
    completed: actions.filter(a => a.status === 'completed').length,
    rescue: actions.filter(a => a.action_type === 'rescue').length,
    medical: actions.filter(a => a.action_type === 'medical').length,
    logistics: actions.filter(a => a.action_type === 'logistics').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation onRefresh={fetchActions} loading={loading} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-green-400" />
              Priority Actions
            </h2>
            <p className="text-slate-400 mt-1">AI-generated response decisions from Kestra workflows</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-slate-400 mt-1">Total Actions</div>
                </div>
                <Target className="h-8 w-8 text-blue-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
                  <div className="text-xs text-slate-400 mt-1">Pending</div>
                </div>
                <Clock className="h-8 w-8 text-yellow-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-400">{stats.inProgress}</div>
                  <div className="text-xs text-slate-400 mt-1">In Progress</div>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-400 opacity-80 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
                  <div className="text-xs text-slate-400 mt-1">Completed</div>
                </div>
                <CheckSquare className="h-8 w-8 text-green-400 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-400" />
                Filters & Sorting
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Action Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types ({actions.length})</SelectItem>
                    <SelectItem value="rescue">🚁 Rescue ({stats.rescue})</SelectItem>
                    <SelectItem value="medical">⚕️ Medical ({stats.medical})</SelectItem>
                    <SelectItem value="logistics">📦 Logistics ({stats.logistics})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority Score</SelectItem>
                    <SelectItem value="impact">Estimated Impact</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">Order</label>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
                >
                  {sortOrder === 'desc' ? (
                    <><ArrowDown className="h-4 w-4 mr-2" /> High to Low</>
                  ) : (
                    <><ArrowUp className="h-4 w-4 mr-2" /> Low to High</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredActions.map((action) => (
            <Card key={action.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${getTypeColor(action.action_type)} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {getTypeIcon(action.action_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-2">{action.description}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge className="bg-slate-700 text-slate-200 border border-slate-600">
                            {action.disasters.title}
                          </Badge>
                          <Badge className={getTypeColor(action.action_type) + ' text-white'}>
                            {action.action_type.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(action.status)}>
                            {action.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {action.priority_score || 0}
                        </div>
                        <div className="text-xs text-slate-400">Priority</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                          <Users className="h-3 w-3" />
                          Estimated Impact
                        </div>
                        <div className="text-white font-semibold text-lg">
                          {action.estimated_impact?.toLocaleString() || 'N/A'}
                        </div>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                          <Clock className="h-3 w-3" />
                          Deadline
                        </div>
                        <div className="text-white font-semibold">
                          {action.deadline ? new Date(action.deadline).toLocaleDateString() : 'No deadline'}
                        </div>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                          <Target className="h-3 w-3" />
                          RL Allocation Score
                        </div>
                        <div className="text-white font-semibold text-lg">
                          {action.allocation_score?.toFixed(2) || 'Pending'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={action.status}
                        onValueChange={(newStatus) => updateActionStatus(action.id, newStatus)}
                      >
                        <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="text-xs text-slate-500 ml-auto">
                        Created {new Date(action.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredActions.length === 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-20">
                <div className="text-center text-slate-500">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Actions Found</p>
                  <p className="text-sm mt-2">Try adjusting your filters or create new disaster reports</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
