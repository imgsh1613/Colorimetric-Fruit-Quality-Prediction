import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Beaker } from 'lucide-react';

// Simulated force-displacement data based on patterns from the actual dataset
const generateForceData = (type, quality) => {
  const points = [];
  const maxDisplacement = quality === 'fresh' ? 6.0 : 5.0;
  const forceMultiplier = quality === 'fresh' ? 1.0 : 0.65;
  
  const typeMultipliers = {
    Apple: 1.0,
    Orange: 1.15,
    Tomato: 0.75,
  };

  const mult = typeMultipliers[type] || 1.0;

  for (let d = 0; d <= maxDisplacement; d += 0.25) {
    const baseForce = 0.02 + (d * 0.016 * forceMultiplier * mult);
    const noise = (Math.sin(d * 5) * 0.002);
    points.push({
      displacement: parseFloat(d.toFixed(2)),
      force: parseFloat((baseForce + noise).toFixed(4)),
    });
  }
  return points;
};

const fruitOptions = ['Apple', 'Orange', 'Tomato'];

const TactileViewer = () => {
  const [selectedFruit, setSelectedFruit] = useState('Apple');
  const [showRotten, setShowRotten] = useState(true);

  const freshData = generateForceData(selectedFruit, 'fresh');
  const rottenData = generateForceData(selectedFruit, 'rotten');

  // Merge data for combined chart
  const combinedData = freshData.map((point, index) => ({
    displacement: point.displacement,
    fresh: point.force,
    rotten: index < rottenData.length ? rottenData[index].force : null,
  }));

  const chartTooltipStyle = {
    background: 'rgba(15, 15, 20, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '13px',
    padding: '8px 14px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  };

  return (
    <section className="py-28 relative" id="tactile">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] left-[40%] w-[600px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[120px]" />
      </div>

      <div className="relative container max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400 mb-4 block">
            Tactile Data
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight gradient-text-white mb-6">
            Force-Displacement
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Compression test data reveals structural differences between fresh and rotten fruit.
          </p>
        </div>

        <div className="rounded-3xl glass-strong p-8">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Compression Analysis</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {fruitOptions.map((fruit) => (
                  <button
                    key={fruit}
                    onClick={() => setSelectedFruit(fruit)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedFruit === fruit
                        ? 'bg-green-500/15 text-green-400 ring-1 ring-green-500/20'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    {fruit}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowRotten(!showRotten)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  showRotten
                    ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {showRotten ? 'Hide' : 'Show'} Rotten
              </button>
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="displacement"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                stroke="rgba(255,255,255,0.06)"
                axisLine={false}
                label={{ value: 'Displacement (mm)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                stroke="rgba(255,255,255,0.06)"
                axisLine={false}
                label={{ value: 'Force (kN)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#666' }}
              />
              <Line
                type="monotone"
                dataKey="fresh"
                name="Fresh"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: 'rgba(255,255,255,0.2)' }}
              />
              {showRotten && (
                <Line
                  type="monotone"
                  dataKey="rotten"
                  name="Rotten"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  strokeDasharray="8 4"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: 'rgba(255,255,255,0.2)' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>

          {/* Insight */}
          <div className="mt-8 p-5 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
            <div className="flex items-start gap-3">
              <Beaker className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white mb-1">Scientific Insight</div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Fresh {selectedFruit.toLowerCase()}s require significantly more force to compress, indicating stronger cellular structure. 
                  Rotten samples show lower resistance due to cell wall breakdown and tissue softening — a key indicator used in quality assessment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TactileViewer;
