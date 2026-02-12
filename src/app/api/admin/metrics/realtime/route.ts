import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserStats } from '@/lib/models/User';
import { getSubscriptionStats } from '@/lib/models/Subscription';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendMetrics = async () => {
        try {
          const [userStats, subscriptionStats] = await Promise.all([
            getUserStats(),
            getSubscriptionStats(),
          ]);

          const data = {
            userStats,
            subscriptionStats,
            timestamp: new Date().toISOString(),
          };

          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error fetching metrics:', error);
        }
      };

      // Send initial data
      await sendMetrics();

      // Update every 5 seconds
      const interval = setInterval(sendMetrics, 5000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
