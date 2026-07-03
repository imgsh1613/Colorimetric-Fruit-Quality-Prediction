import React, { useState, useEffect, useRef } from 'react';

const stats = [
  { value: 18437, suffix: '+', label: 'Training Images', prefix: '' },
  { value: 96, suffix: '%', label: 'Accuracy Rate', prefix: '' },
  { value: 5, suffix: '', label: 'Fruit Types', prefix: '' },
  { value: 2, suffix: 's', label: 'Analysis Time', prefix: '<' },
  { value: 5987, suffix: '+', label: 'Tactile Samples', prefix: '' },
  { value: 100, suffix: '', label: 'Compression Tests', prefix: '' },
];

const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const StatsSection = () => {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
      </div>

      <div className="relative container max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                <AnimatedCounter end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
