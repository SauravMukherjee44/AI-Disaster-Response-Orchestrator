import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('disasters')
      .select(`
        *,
        ai_summaries (*),
        priority_actions (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, disasters: data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const webhookUrl = `${supabaseUrl}/functions/v1/kestra-webhook`;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create disaster');
    }

    const disasterId = data.disaster.id;

    const summarizeUrl = `${supabaseUrl}/functions/v1/ai-summarize`;
    const summarizeResponse = await fetch(summarizeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ disaster_id: disasterId }),
    });

    const prioritizeUrl = `${supabaseUrl}/functions/v1/rl-prioritize`;
    const prioritizeResponse = await fetch(prioritizeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ disaster_id: disasterId }),
    });

    const summaryData = await summarizeResponse.json();
    const prioritizeData = await prioritizeResponse.json();

    return NextResponse.json({
      success: true,
      disaster: data.disaster,
      summary: summaryData.summary,
      actions: prioritizeData.actions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
