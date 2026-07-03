import React from 'react';
import { Brain, Scan, Timer, ShieldCheck, TrendingUp, Layers, Fingerprint, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Deep Learning',
    description: 'MobileNetV2 with transfer learning, fine-tuned on 18,000+ images for precise fruit classification.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Scan,
    title: '3-Fruit Detection',
    description: 'Identifies Apple, Orange, and Tomato — both fresh and rotten states.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Timer,
    title: 'Real-Time Analysis',
    description: 'Get comprehensive quality assessment in under 2 seconds. No waiting, just answers.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Shelf Life Prediction',
    description: 'AI predicts remaining shelf life based on current quality metrics and degradation patterns.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Fingerprint,
    title: 'Multi-Modal Data',
    description: 'Combines visual, tactile force-displacement, and physical dimension data for comprehensive analysis.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Layers,
    title: 'Quality Metrics',
    description: 'Detailed scoring on color, texture, shape, ripeness, and freshness with confidence levels.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Defect Detection',
    description: 'Identifies bruising, spots, cracks, and decay — flags potential safety concerns automatically.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'Actionable advice on storage, handling, and consumption based on detected quality state.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
];

const FeaturesGrid = () => {
  return (
    <section className="py-28 relative" id="features">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[40%] left-[60%] w-[600px] h-[600px] rounded-full bg-purple-500/[0.02] blur-[140px]" />
      </div>

      <div className="relative container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400 mb-4 block">
            Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight gradient-text-white mb-6">
            Powerful Features
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Built for precision. Designed for speed. Every feature crafted to deliver actionable intelligence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-3xl glass hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-1 cursor-default"
              >
                <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>

                <h3 className="text-base font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
