import React, { useState } from 'react';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import UploadZone from './components/UploadZone';
import ResultsPanel from './components/ResultsPanel';
import Chatbot from './components/Chatbot';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFileSelect = async (file) => {
    setIsAnalyzing(true);
    setResults(null);

    // Create preview URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);

    try {
      const { analyzeImage } = await import('./services/api');
      const result = await analyzeImage(file);
      setResults(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      console.warn('⚠️ Backend not available. Using mock data for demonstration.');

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockFruits = ['Apple', 'Orange', 'Banana'];
      const mockQualities = ['Fresh', 'Rotten'];

      const randomFruit = mockFruits[Math.floor(Math.random() * mockFruits.length)];
      const randomQuality = mockQualities[Math.floor(Math.random() * mockQualities.length)];
      const isFresh = randomQuality === 'Fresh';

      const mockResults = {
        fruit_type: randomFruit,
        quality_status: randomQuality,
        confidence: isFresh ? 0.85 + Math.random() * 0.1 : 0.75 + Math.random() * 0.2,
        overallScore: isFresh ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 30) + 20,
        ripeness: isFresh ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 20) + 30,
        freshness: isFresh ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 25) + 15,
        defectCount: isFresh ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3) + 2,
        shelfLife: isFresh ? Math.floor(Math.random() * 4) + 4 : 1,
        recommendations: isFresh
          ? [
              { title: '⚠️ Mock Data', description: 'This is simulated data. Start the backend for real AI analysis.' },
              { title: 'Storage Temperature', description: `Store ${randomFruit.toLowerCase()} at 4-7°C to maintain optimal freshness.` },
              { title: 'Handling', description: 'Handle with care to prevent bruising and surface damage.' },
              { title: 'Consumption Window', description: 'Best consumed within 3-5 days for peak quality.' },
            ]
          : [
              { title: '⚠️ Mock Data', description: 'This is simulated data. Start the backend for real AI analysis.' },
              { title: 'Quality Alert', description: `${randomFruit} shows signs of deterioration. Inspect carefully.` },
              { title: 'Immediate Action', description: 'Use immediately or discard if heavily deteriorated.' },
              { title: 'Separation', description: 'Keep separate from fresh produce to prevent cross-contamination.' },
            ],
      };

      setResults(mockResults);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setResults(null);
    setUploadedImage(null);
    // Scroll to upload
    setTimeout(() => {
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Analyze', href: '#upload-section' },
  ];

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-3 md:mx-4 mt-3 md:mt-4">
          <nav className="max-w-6xl mx-auto px-4 md:px-6 py-3 rounded-2xl glass">
            <div className="flex items-center justify-between">
              <a href="#" className="flex items-center gap-2.5" onClick={() => { setResults(null); setUploadedImage(null); }}>
                <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <span className="font-semibold text-white tracking-tight">FruitSense</span>
              </a>

              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <a key={link.label} href={link.href} className="px-3 py-2 text-sm text-gray-400 hover:text-white rounded-xl transition-colors">
                    {link.label}
                  </a>
                ))}
                {results && (
                  <button onClick={handleAnalyzeAnother} className="px-3 py-2 text-sm text-green-400 hover:text-green-300 rounded-xl transition-colors">
                    New Analysis
                  </button>
                )}
                <div className="w-px h-5 bg-white/10 mx-2" />
                <button
                  onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-5 py-2 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_-4px_rgba(34,197,94,0.4)]"
                >
                  {results ? 'Analyze Another' : 'Analyze Now'}
                </button>
              </div>

              {/* Mobile menu */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-9 h-9 rounded-xl glass flex items-center justify-center">
                <div className="space-y-1.5">
                  <div className={`w-4 h-0.5 bg-white transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <div className={`w-4 h-0.5 bg-white transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                  <div className={`w-4 h-0.5 bg-white transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-white/[0.06] space-y-1">
                {navLinks.map((link) => (
                  <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white rounded-xl transition-colors">
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => { setMobileMenuOpen(false); document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="w-full mt-2 px-5 py-2.5 text-sm font-medium text-black bg-green-500 rounded-xl"
                >
                  Analyze Now
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Pre-upload: Landing content */}
        {!results && (
          <>
            <Hero />
            <HowItWorks />
          </>
        )}

        {/* Upload Zone — always visible */}
        <div id="upload-section">
          <UploadZone onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} />
        </div>

        {/* Post-upload: All results & details only after analysis */}
        {results && (
          <>
            {/* Uploaded Image Preview */}
            {uploadedImage && (
              <section className="pt-8 relative">
                <div className="container max-w-6xl mx-auto px-6">
                  <div className="flex justify-center">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-all" />
                      <img
                        src={uploadedImage}
                        alt="Uploaded fruit"
                        className="relative w-48 h-48 object-cover rounded-2xl ring-2 ring-white/10"
                      />
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm text-white ring-1 ring-white/10 whitespace-nowrap">
                        Your uploaded image
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Full Results — everything about this specific fruit */}
            <ResultsPanel results={results} />

            {/* Analyze Another button */}
            <div className="text-center pb-16">
              <button
                onClick={handleAnalyzeAnother}
                className="group px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-2xl transition-all duration-300 hover:shadow-[0_0_60px_-12px_rgba(34,197,94,0.6)] active:scale-[0.98]"
              >
                <span className="flex items-center gap-2.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Analyze Another Fruit
                </span>
              </button>
              <p className="text-xs text-gray-600 mt-3">Upload a different image for new analysis</p>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04]">
        <div className="container max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <span className="font-semibold text-white text-sm">FruitSense</span>
              <span className="text-xs text-gray-600">· AI Quality Intelligence</span>
            </div>
            <p className="text-xs text-gray-600">© 2026 FruitSense · GAUTAM Project · Powered by MobileNetV2</p>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
}

export default App;
