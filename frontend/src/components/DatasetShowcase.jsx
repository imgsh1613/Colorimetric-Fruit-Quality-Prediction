import React, { useState } from 'react';
import { Apple, Citrus, Cherry, Leaf, ChevronRight, Database, Image, Activity, Ruler } from 'lucide-react';

const fruitData = [
  {
    name: 'Apple',
    emoji: '🍎',
    freshCount: 1693,
    rottenCount: 2342,
    totalImages: 4035,
    tactileSamples: 10,
    avgFreshForce: '0.045 kN',
    avgRottenForce: '0.032 kN',
    shelfLife: '4-6 weeks',
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-500/10',
    border: 'ring-red-500/20',
  },  {
    name: 'Orange',
    emoji: '🍊',
    freshCount: 1466,
    rottenCount: 1595,
    totalImages: 3061,
    tactileSamples: 10,
    avgFreshForce: '0.052 kN',
    avgRottenForce: '0.038 kN',
    shelfLife: '2-4 weeks',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-500/10',
    border: 'ring-orange-500/20',
  },  {
    name: 'Banana',
    emoji: '🍌',
    freshCount: 2100,
    rottenCount: 1800,
    totalImages: 3900,
    tactileSamples: 10,
    avgFreshForce: '0.035 kN',
    avgRottenForce: '0.021 kN',
    shelfLife: '1-2 weeks',
    color: 'from-yellow-500 to-yellow-600',
    bg: 'bg-yellow-500/10',
    border: 'ring-yellow-500/20',
  },
];

const DatasetShowcase = () => {
  const [selectedFruit, setSelectedFruit] = useState(0);
  const fruit = fruitData[selectedFruit];

  const totalImages = fruitData.reduce((sum, f) => sum + f.totalImages, 0);
  const totalFresh = fruitData.reduce((sum, f) => sum + f.freshCount, 0);
  const totalRotten = fruitData.reduce((sum, f) => sum + f.rottenCount, 0);

  return (
    <section className="py-28 relative" id="dataset">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] right-[30%] w-[600px] h-[600px] rounded-full bg-emerald-500/[0.02] blur-[140px]" />
      </div>

      <div className="relative container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400 mb-4 block">
            Dataset
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight gradient-text-white mb-6">
            Training Data
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Our model is trained on a comprehensive multi-modal dataset of fruits and vegetables.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Image, label: 'Visual Images', value: totalImages.toLocaleString(), color: 'text-green-400' },
            { icon: Activity, label: 'Tactile Samples', value: '5,987', color: 'text-blue-400' },
            { icon: Database, label: 'Compression Files', value: '100', color: 'text-purple-400' },
            { icon: Ruler, label: 'Fruit Classes', value: '3', color: 'text-amber-400' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-5 rounded-2xl glass text-center">
                <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Fruit selector + details */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Fruit list */}
          <div className="rounded-3xl glass p-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-4 py-2">
              Select Fruit
            </div>
            {fruitData.map((f, index) => (
              <button
                key={f.name}
                onClick={() => setSelectedFruit(index)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left ${
                  selectedFruit === index
                    ? 'bg-white/[0.08] ring-1 ring-white/10'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                <span className="text-2xl">{f.emoji}</span>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${selectedFruit === index ? 'text-white' : 'text-gray-400'}`}>
                    {f.name}
                  </div>
                  <div className="text-xs text-gray-600">{f.totalImages.toLocaleString()} images</div>
                </div>
                {selectedFruit === index && (
                  <ChevronRight className="w-4 h-4 text-green-400" />
                )}
              </button>
            ))}
          </div>

          {/* Fruit details */}
          <div className="rounded-3xl glass-strong p-8">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-5xl">{fruit.emoji}</span>
              <div>
                <h3 className="text-2xl font-bold text-white">{fruit.name}</h3>
                <p className="text-sm text-gray-500">Multi-modal quality assessment data</p>
              </div>
            </div>

            {/* Distribution bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-green-400 font-medium">Fresh ({fruit.freshCount.toLocaleString()})</span>
                <span className="text-orange-400 font-medium">Rotten ({fruit.rottenCount.toLocaleString()})</span>
              </div>
              <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-l-full transition-all duration-500"
                  style={{ width: `${(fruit.freshCount / fruit.totalImages) * 100}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-r-full transition-all duration-500"
                  style={{ width: `${(fruit.rottenCount / fruit.totalImages) * 100}%` }}
                />
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Images', value: fruit.totalImages.toLocaleString(), icon: '📸' },
                { label: 'Fresh Samples', value: fruit.freshCount.toLocaleString(), icon: '✅' },
                { label: 'Rotten Samples', value: fruit.rottenCount.toLocaleString(), icon: '⚠️' },
                { label: 'Tactile Tests', value: `${fruit.tactileSamples} each`, icon: '🔬' },
                { label: 'Avg Fresh Force', value: fruit.avgFreshForce, icon: '💪' },
                { label: 'Avg Rotten Force', value: fruit.avgRottenForce, icon: '📉' },
              ].map((detail, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                  <div className="text-lg mb-1">{detail.icon}</div>
                  <div className="text-lg font-bold text-white">{detail.value}</div>
                  <div className="text-xs text-gray-500">{detail.label}</div>
                </div>
              ))}
            </div>

            {/* Data types */}
            <div className="mt-8 pt-8 border-t border-white/[0.05]">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Available Data Types</div>
              <div className="flex flex-wrap gap-2">
                {['Visual (Images)', 'Tactile (Force-Displacement)', 'Compression (Time Series)', 'Dimensions (Physical)'].map((type) => (
                  <span key={type} className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 bg-white/[0.03] ring-1 ring-white/[0.06]">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DatasetShowcase;
