import React, { useState } from 'react';
import { ChevronDown, Cpu, ArrowRight, Zap } from 'lucide-react';

const layers = [
  { name: 'Input Layer', params: '-', shape: '224 × 224 × 3', color: 'bg-blue-500', description: 'RGB image input' },
  { name: 'MobileNetV2 Base', params: '2.26M', shape: '7 × 7 × 1280', color: 'bg-purple-500', description: 'Feature extraction (ImageNet pre-trained)' },
  { name: 'Global Avg Pooling', params: '-', shape: '1280', color: 'bg-cyan-500', description: 'Spatial dimension reduction' },
  { name: 'Batch Normalization', params: '5.1K', shape: '1280', color: 'bg-indigo-500', description: 'Training stabilization' },
  { name: 'Dense + ReLU', params: '655K', shape: '512', color: 'bg-green-500', description: 'Feature abstraction' },
  { name: 'Dropout (0.4)', params: '-', shape: '512', color: 'bg-yellow-500', description: 'Regularization' },
  { name: 'Dense + ReLU', params: '131K', shape: '256', color: 'bg-green-500', description: 'Feature compression' },
  { name: 'Dropout (0.3)', params: '-', shape: '256', color: 'bg-yellow-500', description: 'Regularization' },
  { name: 'Dense + Softmax', params: '2.6K', shape: '6', color: 'bg-red-500', description: '6-class classification output' },
];

const ModelArchitecture = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-28 relative" id="architecture">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.02] blur-[120px]" />
      </div>

      <div className="relative container max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400 mb-4 block">
            Under the Hood
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight gradient-text-white mb-6">
            Model Architecture
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            A fine-tuned MobileNetV2 with custom classification head. 4.38M parameters, built for speed and accuracy.
          </p>
        </div>

        {/* Key specs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Parameters', value: '4.38M' },
            { label: 'Trainable', value: '330K' },
            { label: 'Architecture', value: 'MobileNetV2' },
            { label: 'Input Size', value: '224×224' },
          ].map((spec, i) => (
            <div key={i} className="p-5 rounded-2xl glass text-center">
              <div className="text-xl font-bold text-white">{spec.value}</div>
              <div className="text-xs text-gray-500 mt-1">{spec.label}</div>
            </div>
          ))}
        </div>

        {/* Layer visualization */}
        <div className="rounded-3xl glass-strong p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Neural Network Layers</h3>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {expanded ? 'Collapse' : 'Expand All'}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {layers.map((layer, index) => (
              <div key={index}>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                  {/* Color indicator */}
                  <div className={`w-1.5 h-10 rounded-full ${layer.color}`} />
                  
                  {/* Layer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">{layer.name}</span>
                      {expanded && (
                        <span className="text-xs text-gray-600">{layer.description}</span>
                      )}
                    </div>
                    {expanded && (
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">Shape: <span className="text-gray-400">{layer.shape}</span></span>
                        {layer.params !== '-' && (
                          <span className="text-xs text-gray-500">Params: <span className="text-gray-400">{layer.params}</span></span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Output shape badge */}
                  <div className="px-3 py-1 rounded-lg text-xs font-mono text-gray-400 bg-white/[0.03] ring-1 ring-white/[0.06] hidden sm:block">
                    {layer.shape}
                  </div>
                </div>

                {/* Arrow between layers */}
                {index < layers.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-3 h-3 text-gray-700 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Output classes */}
          <div className="mt-8 pt-6 border-t border-white/[0.05]">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Output Classes</div>
            <div className="flex flex-wrap gap-2">
              {['FreshApple', 'FreshOrange', 'FreshBanana', 
                'RottenApple', 'RottenOrange', 'RottenBanana'].map((cls) => (
                <span 
                  key={cls} 
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium ring-1 ${
                    cls.startsWith('Fresh') 
                      ? 'text-green-400 bg-green-500/[0.06] ring-green-500/15' 
                      : 'text-orange-400 bg-orange-500/[0.06] ring-orange-500/15'
                  }`}
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelArchitecture;
