import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const UploadZone = ({ onFileSelect, isAnalyzing }) => {
  const [preview, setPreview] = useState(null);
  
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        setPreview(reader.result);
      };
      
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false,
    disabled: isAnalyzing
  });
  
  return (
    <section id="upload-section" className="py-20 relative">
      {/* Section ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[600px] h-[400px] rounded-full bg-green-500/[0.03] blur-[120px]" />
      </div>
      
      <div className="relative container max-w-3xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text-white mb-4">
            Analyze
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Drop a fruit image and let the AI do the rest.
          </p>
        </div>
        
        {/* Upload area */}
        <div className="rounded-3xl glass-strong glow-green-sm overflow-hidden">
          {preview ? (
            <div className="p-6 md:p-8">
              <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden ring-1 ring-white/10">
                <img 
                  src={preview} 
                  alt="Fruit preview" 
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                    <Loader2 className="w-10 h-10 text-green-400 animate-spin mb-4" />
                    <p className="text-white font-medium text-lg">Analyzing</p>
                    <p className="text-gray-400 text-sm mt-1">Processing your image...</p>
                    
                    {/* Progress bar */}
                    <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full animate-shimmer" 
                        style={{ background: 'linear-gradient(90deg, transparent, #22c55e, transparent)', backgroundSize: '200% 100%' }} 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {!isAnalyzing && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setPreview(null)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-400 hover:text-white rounded-xl glass hover:bg-white/[0.06] transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`
                p-12 md:p-16 text-center cursor-pointer transition-all duration-300
                ${isDragActive ? 'bg-green-500/[0.06]' : 'hover:bg-white/[0.02]'}
                ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center">
                {/* Upload icon */}
                <div className={`
                  w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-300
                  ${isDragActive 
                    ? 'bg-green-500/20 scale-110' 
                    : 'bg-white/[0.04]'
                  }
                `}>
                  {isDragActive ? (
                    <ImageIcon className="w-9 h-9 text-green-400" />
                  ) : (
                    <Upload className="w-9 h-9 text-gray-500" />
                  )}
                </div>
                
                <p className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? 'Drop to analyze' : 'Drop your image here'}
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  or click to browse
                </p>
                
                {/* Supported formats */}
                <div className="flex items-center gap-2">
                  {['PNG', 'JPG', 'WEBP'].map((format) => (
                    <span key={format} className="px-3 py-1 rounded-lg text-xs font-medium text-gray-500 bg-white/[0.03] ring-1 ring-white/[0.06]">
                      {format}
                    </span>
                  ))}
                  <span className="text-xs text-gray-600 ml-1">up to 10MB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UploadZone;
