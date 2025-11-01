"use client";

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import CandleChart from '@/components/CandleChart';
import type { Candle, SignalResult } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'] as const;
const INTERVALS = ['15m', '1h', '4h', '1d'] as const;

type KlinesResponse = {
  symbol: string;
  interval: string;
  limit: number;
  candles: Candle[];
};

type SignalResponse = SignalResult & {
  symbol: string;
  interval: string;
};

export default function Home() {
  const [symbol, setSymbol] = useState<(typeof SYMBOLS)[number]>('BTCUSDT');
  const [interval, setInterval] = useState<(typeof INTERVALS)[number]>('1h');

  const { data: klinesData, isLoading: loadingKlines } = useSWR<KlinesResponse>(
    `/api/klines?symbol=${symbol}&interval=${interval}&limit=500`,
    fetcher,
    { refreshInterval: 30_000 }
  );

  const { data: signalData, isLoading: loadingSignal } = useSWR<SignalResponse>(
    `/api/signals?symbol=${symbol}&interval=${interval}&limit=500`,
    fetcher,
    { refreshInterval: 30_000 }
  );

  const candles = klinesData?.candles ?? [];

  const signalColor = useMemo(() => {
    if (!signalData) return 'bg-gray-500';
    if (signalData.signal === 'BUY') return 'bg-green-600';
    if (signalData.signal === 'SELL') return 'bg-red-600';
    return 'bg-yellow-500';
  }, [signalData]);

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <header className="container mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold">Agentic Crypto Signals</h1>
        <div className="flex flex-wrap gap-3">
          <select
            className="rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value as any)}
          >
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2"
            value={interval}
            onChange={(e) => setInterval(e.target.value as any)}
          >
            {INTERVALS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12">
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-xl border border-zinc-800 bg-zinc-950 p-2 sm:p-4">
            {loadingKlines ? (
              <div className="h-[480px] flex items-center justify-center text-zinc-400">Loading chart...</div>
            ) : candles.length ? (
              <CandleChart candles={candles} className="h-[480px]" />
            ) : (
              <div className="h-[480px] flex items-center justify-center text-zinc-400">No data</div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Current Signal</p>
                  <div className={`mt-2 inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold ${signalColor}`}>
                    {loadingSignal ? '...'
                      : `${signalData?.signal ?? 'NEUTRAL'} ? ${signalData?.confidence ?? 0}%`}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-400">Pair</p>
                  <p className="text-lg font-medium">{symbol}</p>
                  <p className="text-sm text-zinc-400">Interval</p>
                  <p className="text-lg font-medium">{interval}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-sm text-zinc-400">Rationale</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-zinc-300 space-y-1">
                {(signalData?.reasons ?? ['Loading...']).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              {signalData?.indicators && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                    <p className="text-zinc-400">RSI</p>
                    <p className="text-zinc-100">{signalData.indicators.rsi?.toFixed(2) ?? '-'}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                    <p className="text-zinc-400">MACD</p>
                    <p className="text-zinc-100">{signalData.indicators.macd?.toFixed(4) ?? '-'}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                    <p className="text-zinc-400">Signal</p>
                    <p className="text-zinc-100">{signalData.indicators.macdSignal?.toFixed(4) ?? '-'}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                    <p className="text-zinc-400">Histogram</p>
                    <p className="text-zinc-100">{signalData.indicators.macdHistogram?.toFixed(4) ?? '-'}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                    <p className="text-zinc-400">EMA12</p>
                    <p className="text-zinc-100">{signalData.indicators.emaFast?.toFixed(4) ?? '-'}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                    <p className="text-zinc-400">EMA26</p>
                    <p className="text-zinc-100">{signalData.indicators.emaSlow?.toFixed(4) ?? '-'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-400">
              Signals are generated from technical indicators (EMA, MACD, RSI) and are for informational purposes only.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
