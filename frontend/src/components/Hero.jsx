import React from 'react';
import { ArrowRight, Sparkles, Zap, Shield, Eye } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[800px] h-[600px] rounded-full bg-green-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[100px]" />
      </div>
      
      <div className="relative container max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* Badge */}
        <div className="flex justify-center mb-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-gray-300 font-medium">AI-Powered Quality Intelligence</span>
          </div>
        </div>
        
        {/* Main heading */}
        <div className="text-center mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-2">
            <span className="gradient-text">Fruit</span><span className="gradient-text-white">Sense</span>
          </h1>
        </div>
        
        {/* Subtitle */}
        <div className="text-center mb-6 fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-xl md:text-2xl font-medium text-gray-400 tracking-tight">
            Post-Harvest Intelligence, Reimagined.
          </p>
        </div>
        
        {/* Description */}
        <div className="text-center mb-12 fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed text-balance">
            Upload a photo. Get instant AI analysis of quality, ripeness, defects, 
            and shelf life — powered by deep learning.
          </p>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 fade-in-up" style={{ animationDelay: '0.5s' }}>
          <button 
            onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-2xl transition-all duration-300 hover:shadow-[0_0_40px_-8px_rgba(34,197,94,0.5)] active:scale-[0.98]"
          >
            <span className="flex items-center gap-2.5">
              Start Analysis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          
          <button className="px-8 py-4 text-gray-400 hover:text-white font-medium rounded-2xl transition-all duration-300 glass hover:bg-white/[0.06]">
            How It Works
          </button>
        </div>
        
        {/* Feature pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-4 p-5 rounded-2xl glass hover:bg-white/[0.04] transition-all duration-300 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/15 transition-colors">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Deep Vision</div>
              <div className="text-xs text-gray-500">10-class detection</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-5 rounded-2xl glass hover:bg-white/[0.04] transition-all duration-300 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/15 transition-colors">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Instant</div>
              <div className="text-xs text-gray-500">&lt;2s analysis</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-5 rounded-2xl glass hover:bg-white/[0.04] transition-all duration-300 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/15 transition-colors">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Accurate</div>
              <div className="text-xs text-gray-500">95%+ precision</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
