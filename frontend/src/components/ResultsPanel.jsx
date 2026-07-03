import React, { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { CheckCircle2, TrendingUp, AlertTriangle, Clock, ThermometerSun, ShieldCheck, Heart, Calendar, Info, ChefHat, UtensilsCrossed, Download, FileText, Snowflake, Lightbulb, FlaskConical, XCircle, Trash2, ShieldAlert, AlertOctagon } from 'lucide-react';
import { getFruitInfo } from '../data/fruitKnowledge';
import { generateFruitReport } from '../utils/pdfReportGenerator';

const ResultsPanel = ({ results }) => {
  const isFresh = results?.quality_status === 'Fresh';
  const fruitInfo = getFruitInfo(results?.fruit_type);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Calculate metrics based on actual prediction
  const qualityData = useMemo(() => {
    if (!results) return [];
    if (isFresh) {
      return [
        { name: 'Color', value: 75 + Math.floor(results.confidence * 25) },
        { name: 'Texture', value: 70 + Math.floor(results.freshness * 0.25) },
        { name: 'Shape', value: 80 + Math.floor(results.ripeness * 0.15) },
        { name: 'Size', value: 78 + Math.floor(results.overallScore * 0.15) },
        { name: 'Ripeness', value: results.ripeness },
      ];
    } else {
      return [
        { name: 'Color', value: Math.max(15, Math.floor(results.overallScore * 0.4)) },
        { name: 'Texture', value: Math.max(10, Math.floor(results.overallScore * 0.35)) },
        { name: 'Shape', value: Math.max(20, Math.floor(results.overallScore * 0.6)) },
        { name: 'Size', value: Math.max(30, Math.floor(results.overallScore * 0.7)) },
        { name: 'Decay', value: Math.min(95, 60 + Math.floor(results.confidence * 35)) },
      ];
    }
  }, [results, isFresh]);

  const timelineData = useMemo(() => {
    if (!results || !fruitInfo) return [];
    if (isFresh) {
      const maxDays = fruitInfo.shelfLife.fresh.fridgeDays || 7;
      const points = Math.min(maxDays, 10);
      const timeline = [];
      for (let i = 0; i <= points; i++) {
        const decay = (i / points) * (i / points) * 60;
        timeline.push({ day: i === 0 ? 'Now' : `Day ${i}`, quality: Math.max(10, Math.round(results.overallScore - decay)) });
      }
      return timeline;
    } else {
      return [
        { day: '3 days ago', quality: 60 },
        { day: '2 days ago', quality: 40 },
        { day: 'Yesterday', quality: 25 },
        { day: 'Now', quality: results.overallScore },
        { day: 'Tomorrow', quality: Math.max(0, results.overallScore - 10) },
      ];
    }
  }, [results, isFresh, fruitInfo]);

  const getScoreColor = (s) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : s >= 40 ? 'text-orange-400' : 'text-red-400';
  const getScoreLabel = (s, fresh) => {
    if (fresh) return s >= 90 ? 'Excellent' : s >= 75 ? 'Good' : s >= 60 ? 'Fair' : 'Below Average';
    return s >= 40 ? 'Moderate Decay' : s >= 20 ? 'Significant Decay' : 'Severely Deteriorated';
  };
  const getScoreBg = (s) => s >= 80 ? 'bg-green-500/10 ring-green-500/20' : s >= 60 ? 'bg-yellow-500/10 ring-yellow-500/20' : s >= 40 ? 'bg-orange-500/10 ring-orange-500/20' : 'bg-red-500/10 ring-red-500/20';

  const tooltipStyle = {
    background: 'rgba(15, 15, 20, 0.95)', border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px', color: '#fff', fontSize: '13px', padding: '8px 14px',
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      generateFruitReport(results);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  if (!results) return null;

  return (
    <section className="py-16 relative" id="results">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[20%] left-[50%] translate-x-[-50%] w-[700px] h-[500px] rounded-full blur-[140px] ${isFresh ? 'bg-green-500/[0.04]' : 'bg-red-500/[0.04]'}`} />
      </div>

      <div className="relative container max-w-6xl mx-auto px-6">
        {/* ===== HEADER ===== */}
        <div className="text-center mb-10 fade-in-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isFresh ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              {isFresh ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text-white">Analysis Complete</h2>
          </div>
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            {fruitInfo && <span className="text-3xl">{fruitInfo.emoji}</span>}
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white/[0.06] ring-1 ring-white/10 text-white">{results.fruit_type}</span>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ring-1 ${isFresh ? 'bg-green-500/10 text-green-400 ring-green-500/20' : 'bg-red-500/10 text-red-400 ring-red-500/20'}`}>
              {results.quality_status}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] ring-1 ring-white/[0.06] text-gray-400">
              {Math.round(results.confidence * 100)}% confidence
            </span>
          </div>
          {fruitInfo && (
            <p className="text-xs text-gray-600 mt-2 italic">{fruitInfo.scientificName} · {fruitInfo.family} · {fruitInfo.category}</p>
          )}
        </div>

        {/* ===== PDF EXPORT BUTTON ===== */}
        <div className="flex justify-center mb-8">
          <button onClick={handleExportPdf} disabled={exportingPdf}
            className="group flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_40px_-8px_rgba(34,197,94,0.5)] active:scale-[0.98] disabled:opacity-60">
            {exportingPdf ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating Report...</>
            ) : (
              <><FileText className="w-5 h-5" />Export Full Report as PDF<Download className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" /></>
            )}
          </button>
        </div>

        {/* ===== SCORE CARD ===== */}
        <div className={`rounded-3xl glass-strong p-8 md:p-10 mb-6 slide-in ${isFresh ? 'glow-green-sm' : ''}`} style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-3">Quality Score</div>
              <div className={`text-8xl font-bold tracking-tight ${getScoreColor(results.overallScore)}`}>{results.overallScore}</div>
              <div className={`inline-flex mt-3 px-4 py-1.5 rounded-full text-sm font-medium ring-1 ${getScoreBg(results.overallScore)} ${getScoreColor(results.overallScore)}`}>
                {getScoreLabel(results.overallScore, isFresh)}
              </div>
            </div>
            <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              {isFresh ? (
                <>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Ripeness</div>
                    <div className={`text-3xl font-bold ${getScoreColor(results.ripeness)}`}>{results.ripeness}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Freshness</div>
                    <div className={`text-3xl font-bold ${getScoreColor(results.freshness)}`}>{results.freshness}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Defects</div>
                    <div className={`text-3xl font-bold ${results.defectCount <= 1 ? 'text-green-400' : 'text-orange-400'}`}>{results.defectCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Fridge Life</div>
                    <div className="text-3xl font-bold text-cyan-400">{fruitInfo ? fruitInfo.shelfLife.fresh.fridgeDays + 'd' : results.shelfLife + 'd'}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Decay Level</div>
                    <div className="text-3xl font-bold text-red-400">{(results.predicted_weight_loss_percent * 100).toFixed(0)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Edible</div>
                    <div className={`text-3xl font-bold ${results.overallScore >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
                      {results.overallScore >= 40 ? 'Caution' : 'No'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Defects</div>
                    <div className="text-3xl font-bold text-red-400">{results.defectCount}+</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Shelf Life</div>
                    <div className={`text-3xl font-bold ${results.overallScore >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
                      {results.overallScore >= 40 ? '1d' : '0d'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== PHYSIOLOGICAL REGRESSION METRICS ===== */}
        {results.predicted_weight_loss_percent !== undefined && (
          <div className="rounded-3xl glass p-6 md:p-8 mb-6 slide-in" style={{ animationDelay: '0.12s' }}>
            <div className="flex items-center gap-3 mb-6">
              <FlaskConical className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">SE-CNN Physiological Analysis</h3>
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/15">Regression Data</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Predicted Weight Loss</div>
                <div className="text-3xl font-bold text-white mb-1">{(results.predicted_weight_loss_percent * 100).toFixed(1)}<span className="text-lg text-gray-500">%</span></div>
                <div className="text-xs text-gray-400">Moisture evaporation proxy</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Predicted Firmness</div>
                <div className="text-3xl font-bold text-white mb-1">{results.predicted_hardness_N?.toFixed(2)}<span className="text-lg text-gray-500"> N</span></div>
                <div className="text-xs text-gray-400">Structural integrity</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Predicted Brittleness</div>
                <div className="text-3xl font-bold text-white mb-1">{results.predicted_brittleness?.toFixed(2)}<span className="text-lg text-gray-500"></span></div>
                <div className="text-xs text-gray-400">Textural deformation</div>
              </div>
            </div>
          </div>
        )}

        {/* ===== COLORIMETRIC ANALYSIS METRICS ===== */}
        {results.colorimetric_data && (
          <div className="rounded-3xl glass p-6 md:p-8 mb-6 slide-in" style={{ animationDelay: '0.13s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Colorimetric Mathematical Extraction</h3>
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/15">CIE L*a*b*</span>
            </div>
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">L* (Lightness)</div>
                <div className="text-2xl font-bold text-white mb-1">{results.colorimetric_data.L}</div>
                <div className="text-[10px] text-gray-400">Scale 0 to 100</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">a* (Red-Green)</div>
                <div className="text-2xl font-bold text-white mb-1">{results.colorimetric_data.a}</div>
                <div className="text-[10px] text-gray-400">Chrominance proxy</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">b* (Yellow-Blue)</div>
                <div className="text-2xl font-bold text-white mb-1">{results.colorimetric_data.b}</div>
                <div className="text-[10px] text-gray-400">Chrominance proxy</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Hue Angle (H°)</div>
                <div className="text-2xl font-bold text-white mb-1">{results.colorimetric_data.H}<span className="text-sm text-gray-500">°</span></div>
                <div className="text-[10px] text-gray-400">Angular color phase</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* ROTTEN: Show urgent warning instead of storage guide        */}
        {/* ========================================================== */}
        {!isFresh && (
          <div className="rounded-3xl bg-red-950/30 ring-1 ring-red-500/20 p-6 md:p-8 mb-6 slide-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-3 mb-5">
              {results.overallScore >= 40 ? (
                <ShieldAlert className="w-6 h-6 text-orange-400" />
              ) : (
                <AlertOctagon className="w-6 h-6 text-red-400" />
              )}
              <h3 className={`text-xl font-bold ${results.overallScore >= 40 ? 'text-orange-400' : 'text-red-400'}`}>
                {results.overallScore >= 40 ? 'Caution: Consume Soon' : 'Warning: Do Not Consume'}
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-5 rounded-2xl bg-red-500/[0.06] ring-1 ring-red-500/15 text-center">
                <Trash2 className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-red-400">Discard Immediately</div>
                <div className="text-xs text-gray-500 mt-1">Not safe for consumption</div>
              </div>
              <div className="p-5 rounded-2xl bg-red-500/[0.06] ring-1 ring-red-500/15 text-center">
                <ShieldAlert className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-orange-400">Separate From Fresh</div>
                <div className="text-xs text-gray-500 mt-1">Prevents cross-contamination</div>
              </div>
              <div className="p-5 rounded-2xl bg-red-500/[0.06] ring-1 ring-red-500/15 text-center">
                <AlertTriangle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-yellow-400">Check Nearby Produce</div>
                <div className="text-xs text-gray-500 mt-1">Decay can spread to others</div>
              </div>
              <div className="p-5 rounded-2xl bg-red-500/[0.06] ring-1 ring-red-500/15 text-center">
                <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-red-400">0 Days Remaining</div>
                <div className="text-xs text-gray-500 mt-1">Past shelf life</div>
              </div>
            </div>

            {/* Spoilage signs detected */}
            {fruitInfo && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-red-400/70 mb-3">Spoilage Indicators Detected</div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {fruitInfo.rottenIndicators.map((ind, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="text-gray-400">{ind}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* FRESH: Fridge / Storage Guide                              */}
        {/* ========================================================== */}
        {isFresh && fruitInfo && (
          <div className="rounded-3xl glass p-6 md:p-8 mb-6 slide-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Snowflake className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">How Long Can You Keep It?</h3>
              <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 ring-1 ring-green-500/15">Fresh — Safe to Store</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '🧊', label: 'Whole in Fridge', value: fruitInfo.fridgeGuide.wholeInFridge, color: 'text-cyan-400' },
                { icon: '🔪', label: 'Cut in Fridge', value: fruitInfo.fridgeGuide.cutInFridge, color: 'text-blue-400' },
                { icon: '🏠', label: 'Room Temperature', value: fruitInfo.fridgeGuide.roomTemperature, color: 'text-amber-400' },
                { icon: '❄️', label: 'Freezer', value: fruitInfo.fridgeGuide.freezer, color: 'text-indigo-400' },
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05] hover:bg-white/[0.04] transition-all">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className={`text-sm font-bold ${item.color} mb-1`}>{item.value}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.05]">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Key Storage Tips</div>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {fruitInfo.storageTips.slice(0, 6).map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-500 flex-shrink-0" />
                    <span className="text-gray-400">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== FRUIT DETAILS CARD ===== */}
        {fruitInfo && (
          <div className="rounded-3xl glass p-6 md:p-8 mb-6 slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">About {results.fruit_type}</h3>
              <span className="text-xs text-gray-600 italic ml-auto">{fruitInfo.origin} · {fruitInfo.season}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <Calendar className={`w-4 h-4 mb-2 ${isFresh ? 'text-green-400' : (results.overallScore >= 40 ? 'text-orange-400' : 'text-red-400')}`} />
                <div className="text-base font-bold text-white">
                  {isFresh ? fruitInfo.shelfLife.fresh.label : (results.overallScore >= 40 ? '1 Day' : 'Expired')}
                </div>
                <div className="text-xs text-gray-500">
                  {isFresh ? 'Remaining Shelf Life' : (results.overallScore >= 40 ? 'Last Day of Freshness' : 'Past Shelf Life — Discard')}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <ThermometerSun className="w-4 h-4 text-amber-400 mb-2" />
                <div className="text-base font-bold text-white">{fruitInfo.storageTemp}</div>
                <div className="text-xs text-gray-500">{isFresh ? 'Optimal Storage Temp' : 'Would have needed this temp'}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <Heart className="w-4 h-4 text-red-400 mb-2" />
                <div className="text-base font-bold text-white">{fruitInfo.nutritionalInfo.calories} kcal</div>
                <div className="text-xs text-gray-500">per 100g · Water: {fruitInfo.nutritionalInfo.water}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <FlaskConical className="w-4 h-4 text-cyan-400 mb-2" />
                <div className="text-base font-bold text-white">{fruitInfo.avgCompressionForce[isFresh ? 'fresh' : 'rotten']} kN</div>
                <div className="text-xs text-gray-500">Compression Force ({results.quality_status})</div>
              </div>
            </div>

            {/* Nutrition */}
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Nutritional Information (per 100g)</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {Object.entries(fruitInfo.nutritionalInfo).map(([key, value]) => (
                  <div key={key} className="p-2.5 rounded-xl bg-white/[0.02] text-center">
                    <div className="text-xs font-bold text-white">{value}</div>
                    <div className="text-[10px] text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Benefits */}
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Health Benefits {!isFresh && '(When Fresh)'}</div>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {fruitInfo.healthBenefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${isFresh ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <span className={`${isFresh ? 'text-gray-400' : 'text-gray-600'}`}>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Indicators */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  {isFresh ? 'Fresh Indicators (Confirmed)' : 'Spoilage Signs (Detected)'}
                </div>
                <div className="space-y-1.5">
                  {(isFresh ? fruitInfo.freshIndicators : fruitInfo.rottenIndicators).map((ind, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isFresh ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-gray-400">{ind}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Buying Tips (Next Time)</div>
                <div className="space-y-1.5">
                  {fruitInfo.buyingTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-500 flex-shrink-0" />
                      <span className="text-gray-400">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ethylene + Defects */}
            <div className="mt-6 pt-4 border-t border-white/[0.05] flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-500">Known Defects:</span>
              {fruitInfo.commonDefects.map((d) => (
                <span key={d} className="px-2 py-1 rounded-lg text-xs text-gray-400 bg-white/[0.03] ring-1 ring-white/[0.06]">{d}</span>
              ))}
              <span className="ml-auto text-xs text-gray-600">
                {fruitInfo.ethyleneProducer && 'Ethylene Producer'}
                {fruitInfo.ethyleneProducer && fruitInfo.ethyleneSensitive && ' · '}
                {fruitInfo.ethyleneSensitive && 'Ethylene Sensitive'}
              </span>
            </div>
          </div>
        )}

        {/* ===== CHEF'S CORNER — Only prominent for fresh ===== */}
        {fruitInfo && (
          <div className={`rounded-3xl glass p-6 md:p-8 mb-6 slide-in ${!isFresh ? 'opacity-60' : ''}`} style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center gap-3 mb-6">
              <ChefHat className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Chef's Corner</h3>
              {!isFresh && <span className="px-2.5 py-1 rounded-lg text-xs text-red-300 bg-red-500/10 ring-1 ring-red-500/15">For Fresh {results.fruit_type} Only</span>}
              {isFresh && <span className="px-2.5 py-1 rounded-lg text-xs text-purple-300 bg-purple-500/10 ring-1 ring-purple-500/15">Culinary Guide</span>}
            </div>

            {!isFresh && (
              <div className="p-4 rounded-2xl bg-red-500/[0.06] ring-1 ring-red-500/15 mb-6">
                <p className="text-sm text-red-300 font-medium">This {results.fruit_type.toLowerCase()} is rotten and should not be consumed. Below is information for when you buy a fresh one next time.</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div className="p-5 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Flavor Profile</div>
                <div className="text-sm text-gray-300 italic">{fruitInfo.flavorProfile}</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Popular Varieties</div>
                <div className="flex flex-wrap gap-1.5">
                  {fruitInfo.varieties.map((v) => (
                    <span key={v} className="px-2 py-0.5 rounded-md text-xs text-gray-400 bg-white/[0.03] ring-1 ring-white/[0.06]">{v}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Culinary Uses</div>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {fruitInfo.culinaryUses.map((use, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <UtensilsCrossed className="w-3 h-3 text-purple-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-400">{use}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Recommended Recipes</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fruitInfo.recipes.map((r, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05] hover:bg-white/[0.04] transition-all group cursor-default">
                    <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{r.name}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${r.difficulty === 'Easy' ? 'text-green-400 bg-green-500/10' : r.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'}`}>
                        {r.difficulty}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{r.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs font-semibold text-gray-500 mb-2">Cheese Pairings</div>
                <div className="text-sm text-gray-400">{fruitInfo.pairings.cheese.join(', ')}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs font-semibold text-gray-500 mb-2">Spice Pairings</div>
                <div className="text-sm text-gray-400">{fruitInfo.pairings.spices.join(', ')}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05]">
                <div className="text-xs font-semibold text-gray-500 mb-2">Also Pairs With</div>
                <div className="text-sm text-gray-400">{fruitInfo.pairings.other.join(', ')}</div>
              </div>
            </div>
          </div>
        )}

        {/* ===== FUN FACTS ===== */}
        {fruitInfo && fruitInfo.funFacts && (
          <div className="rounded-3xl glass p-6 mb-6 slide-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Did You Know?</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {fruitInfo.funFacts.map((fact, i) => (
                <div key={i} className="p-4 rounded-xl bg-yellow-500/[0.04] ring-1 ring-yellow-500/10 text-sm text-gray-400">
                  {fact}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== CHARTS ===== */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="rounded-3xl glass p-6 slide-in" style={{ animationDelay: '0.35s' }}>
            <h3 className="text-lg font-semibold text-white mb-1">{isFresh ? 'Quality Breakdown' : 'Deterioration Analysis'}</h3>
            <p className="text-sm text-gray-500 mb-4">{isFresh ? 'Multi-dimensional quality assessment' : 'Severity of decay across dimensions'}</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={qualityData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke={isFresh ? '#22c55e' : '#ef4444'} fill={isFresh ? '#22c55e' : '#ef4444'} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-3xl glass p-6 slide-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              {isFresh ? 'Quality Trajectory' : 'Decay Timeline'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {isFresh
                ? `Predicted quality over ${fruitInfo ? fruitInfo.shelfLife.fresh.label : 'coming days'}`
                : 'Estimated deterioration timeline'}
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} stroke="rgba(255,255,255,0.06)" axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} stroke="rgba(255,255,255,0.06)" axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="quality" stroke={isFresh ? '#22c55e' : '#ef4444'} strokeWidth={3} dot={{ fill: isFresh ? '#22c55e' : '#ef4444', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 2, stroke: 'rgba(255,255,255,0.2)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ===== RECOMMENDATIONS ===== */}
        <div className="rounded-3xl glass p-6 md:p-8 mb-6 slide-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-lg font-semibold text-white mb-1">{isFresh ? 'AI Recommendations' : 'Urgent Actions Required'}</h3>
          <p className="text-sm text-gray-500 mb-6">{isFresh ? 'Tips to maintain quality' : 'Important steps to take immediately'}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {results.recommendations.map((rec, i) => {
              const icons = isFresh
                ? [ShieldCheck, ThermometerSun, CheckCircle2, Calendar]
                : [AlertOctagon, Trash2, ShieldAlert, AlertTriangle];
              const Icon = icons[i % icons.length];
              return (
                <div key={i} className={`group p-5 rounded-2xl transition-all duration-300 ${!isFresh ? 'bg-red-500/[0.06] ring-1 ring-red-500/15' : 'bg-white/[0.02] ring-1 ring-white/[0.05] hover:bg-white/[0.04]'}`}>
                  <div className="flex gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${!isFresh ? 'bg-red-500/15' : 'bg-green-500/10'}`}>
                      <Icon className={`w-4 h-4 ${!isFresh ? 'text-red-400' : 'text-green-400'}`} />
                    </div>
                    <div>
                      <div className={`font-medium text-sm mb-1 ${!isFresh ? 'text-red-300' : 'text-white'}`}>{rec.title.replace('⚠️ ', '')}</div>
                      <div className="text-sm text-gray-500 leading-relaxed">{rec.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== BOTTOM PDF EXPORT ===== */}
        <div className="text-center mt-8">
          <button onClick={handleExportPdf} disabled={exportingPdf}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-gray-400 glass hover:bg-white/[0.06] hover:text-white transition-all">
            <Download className="w-4 h-4" />
            {exportingPdf ? 'Generating...' : 'Download Complete A-to-Z Report (PDF)'}
          </button>
          <p className="text-xs text-gray-600 mt-2">
            {isFresh ? 'Includes quality metrics, fridge guide, nutrition, recipes, pairings, and more' : 'Includes deterioration analysis, safety warnings, and prevention tips'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResultsPanel;
