import React from 'react';
import { Upload, Cpu, BarChart3, CheckCircle, ArrowDown } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Image',
    description: 'Drag & drop or click to upload a high-quality photo of your fruit. Supports PNG, JPG, and WEBP formats.',
    color: 'from-green-500 to-emerald-500',
    glow: 'bg-green-500/10',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI Processing',
    description: 'Our MobileNetV2 deep learning model analyzes the image, identifying the fruit type and evaluating quality metrics.',
    color: 'from-blue-500 to-cyan-500',
    glow: 'bg-blue-500/10',
  },
  {
    icon: BarChart3,
    step: '03',
    title: 'Quality Analysis',
    description: 'Advanced algorithms assess ripeness, freshness, texture, and detect any defects or signs of deterioration.',
    color: 'from-purple-500 to-pink-500',
    glow: 'bg-purple-500/10',
  },
  {
    icon: CheckCircle,
    step: '04',
    title: 'Get Results',
    description: 'Receive a comprehensive report with quality scores, shelf life prediction, and actionable recommendations.',
    color: 'from-amber-500 to-orange-500',
    glow: 'bg-amber-500/10',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-28 relative" id="how-it-works">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[50%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.02] blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/[0.02] blur-[100px]" />
      </div>

      <div className="relative container max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400 mb-4 block">
            Process
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight gradient-text-white mb-6">
            How It Works
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            From upload to insight in seconds. Four simple steps to assess fruit quality.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}

                <div className="p-8 rounded-3xl glass hover:bg-white/[0.04] transition-all duration-500 group-hover:-translate-y-2 h-full">
                  {/* Step number */}
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-6">
                    Step {step.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${step.glow} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 bg-gradient-to-r ${step.color} bg-clip-text`} style={{ color: `var(--tw-gradient-from)` }} />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
