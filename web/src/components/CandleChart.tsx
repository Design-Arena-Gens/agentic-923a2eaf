"use client";

import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { Candle } from '@/lib/types';

type Props = {
  candles: Candle[];
  className?: string;
};

export default function CandleChart({ candles, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart: any = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#0b1220' }, textColor: '#d1d5db' },
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      autoSize: true,
    });
    chartRef.current = chart;

    const series = chart.addCandlestickSeries({
      upColor: '#16a34a', downColor: '#ef4444', borderVisible: false, wickUpColor: '#16a34a', wickDownColor: '#ef4444',
    });

    const data = candles.map((c) => ({
      time: Math.floor(c.time / 1000),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    series.setData(data);

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({ autoSize: true });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candles]);

  return <div ref={containerRef} className={className} />;
}
