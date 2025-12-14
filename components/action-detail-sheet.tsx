'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase, PriorityAction, Resource } from '@/lib/supabase';
import {
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Calendar,
  MapPin,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

interface ActionDetailSheetProps {
  action: PriorityAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ActionDetailSheet({ action, open, onOpenChange, onUpdate }: ActionDetailSheetProps) {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchResources();
    }
  }, [open]);

  const fetchResources = async () => {
    const { data } = await supabase
      .from('resources')
      .select('*')
      .eq('status', 'available');
    setResources(data || []);
  };

  if (!action) return null;

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('priority_actions')
        .update(updates)
        .eq('id', action.id);

      if (error) throw error;

      toast.success(`Action ${newStatus === 'completed' ? 'completed' : 'status updated'}!`);
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const assignResource = async () => {
    if (!selectedResource) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('resource_allocations')
        .insert({
          action_id: action.id,
          resource_id: selectedResource,
          allocation_score: 0.85,
          estimated_arrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'assigned',
        });

      if (error) throw error;

      await supabase
        .from('resources')
        .update({ status: 'deployed' })
        .eq('id', selectedResource);

      toast.success('Resource assigned successfully!');
      fetchResources();
      onUpdate();
      setSelectedResource('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const actionIcons = {
    rescue: Users,
    medical: Package,
    logistics: Package,
    communication: Package,
  };

  const Icon = actionIcons[action.action_type] || Users;

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 border-gray-300',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  const getProgressValue = () => {
    if (action.status === 'completed') return 100;
    if (action.status === 'in_progress') return 50;
    return 0;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${action.priority_score >= 80 ? 'bg-red-100' : action.priority_score >= 60 ? 'bg-orange-100' : 'bg-blue-100'}`}>
              <Icon className={`h-6 w-6 ${action.priority_score >= 80 ? 'text-red-600' : action.priority_score >= 60 ? 'text-orange-600' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="text-xs">{action.action_type}</Badge>
                <Badge variant="outline" className={statusColors[action.status]}>
                  {action.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <SheetTitle className="text-lg leading-tight">
                {action.description}
              </SheetTitle>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 font-medium">Priority Score</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {action.priority_score}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-500" />
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">Progress</h4>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${getProgressValue()}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{getProgressValue()}% complete</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Estimated Impact</span>
              </div>
              <p className="text-lg font-semibold">{action.estimated_impact.toLocaleString()}</p>
              <p className="text-xs text-gray-500">people helped</p>
            </div>

            {action.deadline && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">Deadline</span>
                </div>
                <p className="text-sm font-semibold">
                  {new Date(action.deadline).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(action.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3">Assign Resources</h4>
            <div className="flex gap-2">
              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {resource.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={assignResource} disabled={loading || !selectedResource}>
                Assign
              </Button>
            </div>
            {resources.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">No available resources</p>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3">Update Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {action.status === 'pending' && (
                <Button
                  onClick={() => updateStatus('in_progress')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Action
                </Button>
              )}

              {(action.status === 'pending' || action.status === 'in_progress') && (
                <Button
                  onClick={() => updateStatus('completed')}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}

              {action.status !== 'cancelled' && (
                <Button
                  onClick={() => updateStatus('cancelled')}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Created: {new Date(action.created_at).toLocaleString()}</p>
            {action.completed_at && (
              <p>Completed: {new Date(action.completed_at).toLocaleString()}</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
