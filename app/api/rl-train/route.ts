import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { episodes = 1000 } = await request.json();

    const trainingData = {
      model_version: `oumi-rl-v${Date.now()}`,
      episodes,
      status: 'training',
      started_at: new Date().toISOString(),
    };

    const { data: trainingRecord, error: insertError } = await supabase
      .from('rl_training_data')
      .insert({
        action_type: 'training_session',
        success: true,
        metadata: trainingData,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const mockTrainingResults = {
      success: true,
      training_id: trainingRecord.id,
      episodes,
      avg_reward: 65.5 + Math.random() * 10,
      final_performance: {
        fast_response_rate: 0.78 + Math.random() * 0.15,
        resource_efficiency: 0.85 + Math.random() * 0.10,
        people_helped_per_episode: 1200 + Math.random() * 300,
      },
      message: 'RL training completed successfully',
    };

    return NextResponse.json(mockTrainingResults);
  } catch (error: any) {
    console.error('RL training error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('rl_training_data')
      .select('*')
      .eq('action_type', 'training_session')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      training_sessions: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
