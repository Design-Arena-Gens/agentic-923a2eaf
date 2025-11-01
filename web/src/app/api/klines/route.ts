import { NextResponse } from 'next/server';
import { fetchBinanceKlines, Interval } from '@/lib/binance';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
  const interval = (searchParams.get('interval') || '1h') as Interval;
  const limit = Number(searchParams.get('limit') || '500');

  try {
    const candles = await fetchBinanceKlines({ symbol, interval, limit });
    return NextResponse.json({ symbol, interval, limit, candles });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch klines' },
      { status: 500 }
    );
  }
}
