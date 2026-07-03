import React, { useState } from 'react';
import { Scale, ArrowLeftRight } from 'lucide-react';

const fruits = [
  { name: 'Apple', emoji: '🍎', freshness: 92, ripeness: 88, texture: 95, color: 90, shelfLife: '4-6 weeks', force: 0.045, category: 'Fruit' },
  { name: 'Orange', emoji: '🍊', freshness: 90, ripeness: 85, texture: 92, color: 94, shelfLife: '2-4 weeks', force: 0.052, category: 'Citrus' },
  { name: 'Tomato', emoji: '🍅', freshness: 82, ripeness: 92, texture: 78, color: 92, shelfLife: '1-2 weeks', force: 0.035, category: 'Fruit' },
];

const ComparisonTool = () => {
  const [leftFruit, setLeftFruit] = useState(0);
  const [rightFruit, setRightFruit] = useState(2);

  const left = fruits[leftFruit];
  const right = fruits[rightFruit];

  const metrics = [
    { name: 'Freshness', left: left.freshness, right: right.freshness },
    { name: 'Ripeness', left: left.ripeness, right: right.ripeness },
    { name: 'Texture', left: left.texture, right: right.texture },
    { name: 'Color Quality', left: left.color, right: right.color },
    { name: 'Compression Force', left: Math.round(left.force * 1000), right: Math.round(right.force * 1000), suffix: 'N' },
  ];

  return (
    <section className="py-28 relative" id="compare">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[40%] right-[20%] w-[500px] h-[500px] rounded-full bg-green-500/[0.02] blur-[120px]" />
      </div>

      <div className="relative container max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400 mb-4 block">
            Interactive
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight gradient-text-white mb-6">
            Compare Fruits
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Side-by-side comparison of quality metrics from our dataset.
          </p>
        </div>

        <div className="rounded-3xl glass-strong p-8">
          {/* Fruit selectors */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-10">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{left.emoji}</span>
              <select
                value={leftFruit}
                onChange={(e) => setLeftFruit(Number(e.target.value))}
                className="bg-white/[0.05] text-white text-lg font-semibold border-none rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-500/30 cursor-pointer appearance-none"
              >
                {fruits.map((f, i) => (
                  <option key={f.name} value={i} className="bg-gray-900">{f.name}</option>
                ))}
              </select>
            </div>

            <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-gray-500" />
            </div>

            <div className="flex items-center gap-3 justify-end">
              <select
                value={rightFruit}
                onChange={(e) => setRightFruit(Number(e.target.value))}
                className="bg-white/[0.05] text-white text-lg font-semibold border-none rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-500/30 cursor-pointer appearance-none text-right"
              >
                {fruits.map((f, i) => (
                  <option key={f.name} value={i} className="bg-gray-900">{f.name}</option>
                ))}
              </select>
              <span className="text-4xl">{right.emoji}</span>
            </div>
          </div>

          {/* Metric bars */}
          <div className="space-y-6">
            {metrics.map((metric) => {
              const maxVal = metric.suffix === 'N' ? 70 : 100;
              const leftWidth = (metric.left / maxVal) * 100;
              const rightWidth = (metric.right / maxVal) * 100;
              const leftWins = metric.left > metric.right;
              const rightWins = metric.right > metric.left;

              return (
                <div key={metric.name}>
                  <div className="flex items-center justify-between mb-2 text-xs text-gray-500 uppercase tracking-wider">
                    <span className={`font-bold text-sm tabular-nums ${leftWins ? 'text-green-400' : 'text-gray-400'}`}>
                      {metric.left}{metric.suffix || '%'}
                    </span>
                    <span className="font-medium">{metric.name}</span>
                    <span className={`font-bold text-sm tabular-nums ${rightWins ? 'text-green-400' : 'text-gray-400'}`}>
                      {metric.right}{metric.suffix || '%'}
                    </span>
                  </div>
                  <div className="flex gap-1.5 h-2.5">
                    <div className="flex-1 bg-white/[0.04] rounded-full overflow-hidden flex justify-end">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${leftWins ? 'bg-green-500' : 'bg-gray-600'}`}
                        style={{ width: `${leftWidth}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${rightWins ? 'bg-green-500' : 'bg-gray-600'}`}
                        style={{ width: `${rightWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional info */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/[0.05]">
            <div className="p-4 rounded-2xl bg-white/[0.02] text-center">
              <div className="text-sm font-semibold text-white">{left.shelfLife}</div>
              <div className="text-xs text-gray-500">Shelf Life</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] text-center">
              <div className="text-sm font-semibold text-white">{right.shelfLife}</div>
              <div className="text-xs text-gray-500">Shelf Life</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTool;
