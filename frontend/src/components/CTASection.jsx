import React from 'react';
import { ArrowRight, Sparkles, Github, Mail } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[1000px] h-[600px] rounded-full bg-green-500/[0.05] blur-[160px]" />
      </div>

      <div className="relative container max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gray-300 mb-8">
          <Sparkles className="w-4 h-4 text-green-400" />
          Open Source Project
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight gradient-text-white mb-6">
          Ready to Analyze?
        </h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-12">
          Upload your first fruit image and experience AI-powered quality intelligence. 
          Built for researchers, farmers, and food quality professionals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-2xl transition-all duration-300 hover:shadow-[0_0_60px_-12px_rgba(34,197,94,0.6)] active:scale-[0.98]"
          >
            <span className="flex items-center gap-2.5">
              Start Analysis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          <button className="px-8 py-4 text-gray-400 hover:text-white font-medium rounded-2xl transition-all duration-300 glass hover:bg-white/[0.06] flex items-center gap-2.5">
            <Github className="w-4 h-4" />
            View on GitHub
          </button>
        </div>

        {/* Tech stack */}
        <div className="pt-8 border-t border-white/[0.04]">
          <div className="text-xs text-gray-600 uppercase tracking-wider mb-4">Built With</div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            {['React', 'Vite', 'TensorFlow', 'MobileNetV2', 'FastAPI', 'Python', 'Recharts'].map((tech) => (
              <span key={tech} className="hover:text-gray-300 transition-colors cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
