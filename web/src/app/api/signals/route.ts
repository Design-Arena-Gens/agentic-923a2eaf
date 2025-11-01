import { NextResponse } from 'next/server';
import { fetchBinanceKlines, Interval } from '@/lib/binance';
import { computeSignal } from '@/lib/signals';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
  const interval = (searchParams.get('interval') || '1h') as Interval;
  const limit = Number(searchParams.get('limit') || '500');

  try {
    const candles = await fetchBinanceKlines({ symbol, interval, limit });
    const result = computeSignal(candles);
    return NextResponse.json({ symbol, interval, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to compute signal' },
      { status: 500 }
    );
  }
}
