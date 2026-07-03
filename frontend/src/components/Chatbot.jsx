import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import { fruitKnowledge, getAllFruitNames } from '../data/fruitKnowledge';

const quickReplies = [
  'How long can I store an apple?',
  'Tell me about mango nutrition',
  'How to check if an apple is fresh?',
  'Compare apple vs orange',
  'Signs of rotten mango',
];

const generateResponse = (input) => {
  const lower = input.toLowerCase().trim();
  const fruits = getAllFruitNames();

  // Find mentioned fruit
  let mentionedFruit = null;
  for (const fruit of fruits) {
    if (lower.includes(fruit.toLowerCase())) {
      mentionedFruit = fruit;
      break;
    }
  }

  // Compare two fruits
  const compareMatch = fruits.filter((f) => lower.includes(f.toLowerCase()));
  if ((lower.includes('compare') || lower.includes('vs') || lower.includes('versus') || lower.includes('difference')) && compareMatch.length >= 2) {
    const a = fruitKnowledge[compareMatch[0]];
    const b = fruitKnowledge[compareMatch[1]];
    return {
      text: `📊 **${compareMatch[0]} vs ${compareMatch[1]}**\n\n` +
        `| Metric | ${a.emoji} ${compareMatch[0]} | ${b.emoji} ${compareMatch[1]} |\n` +
        `|--------|---------|----------|\n` +
        `| Shelf Life | ${a.shelfLife.fresh.label} | ${b.shelfLife.fresh.label} |\n` +
        `| Calories | ${a.caloriesPer100g}/100g | ${b.caloriesPer100g}/100g |\n` +
        `| Storage Temp | ${a.storageTemp} | ${b.storageTemp} |\n` +
        `| Vitamin C | ${a.nutritionalInfo.vitaminC} | ${b.nutritionalInfo.vitaminC} |\n` +
        `| Compression Force | ${a.avgCompressionForce.fresh} kN | ${b.avgCompressionForce.fresh} kN |\n` +
        `| Dataset Images | ${a.datasetStats.totalImages} | ${b.datasetStats.totalImages} |`,
      type: 'comparison',
    };
  }

  if (mentionedFruit) {
    const info = fruitKnowledge[mentionedFruit];

    // Shelf life / how long / days / store / storage
    if (lower.includes('shelf') || lower.includes('how long') || lower.includes('days') || lower.includes('store') || lower.includes('storage') || lower.includes('keep') || lower.includes('last')) {
      return {
        text: `${info.emoji} **${mentionedFruit} Storage Guide**\n\n` +
          `📅 **Shelf Life:** ${info.shelfLife.fresh.label} (${info.shelfLife.fresh.days} days)\n` +
          `🌡️ **Ideal Temp:** ${info.storageTemp}\n` +
          `💧 **Humidity:** ${info.humidity}\n\n` +
          `**Storage Tips:**\n${info.storageTips.map((t) => `• ${t}`).join('\n')}`,
        type: 'storage',
      };
    }

    // Nutrition / calories / vitamins / health
    if (lower.includes('nutri') || lower.includes('calori') || lower.includes('vitamin') || lower.includes('health') || lower.includes('benefit')) {
      const n = info.nutritionalInfo;
      return {
        text: `${info.emoji} **${mentionedFruit} Nutrition** (per 100g)\n\n` +
          `🔥 Calories: **${n.calories} kcal**\n` +
          `🍞 Carbs: **${n.carbs}**\n` +
          `🌾 Fiber: **${n.fiber}**\n` +
          `🍬 Sugar: **${n.sugar}**\n` +
          `💊 Vitamin C: **${n.vitaminC}**\n` +
          `💧 Water: **${n.water}**\n` +
          `⚡ Potassium: **${n.potassium}**\n` +
          (n.lycopene ? `❤️ Lycopene: **${n.lycopene}**` : '') +
          (n.vitaminA ? `\n👁️ Vitamin A: **${n.vitaminA}**` : ''),
        type: 'nutrition',
      };
    }

    // Fresh indicators / how to check / quality / identify
    if (lower.includes('fresh') || lower.includes('check') || lower.includes('identify') || lower.includes('good') || lower.includes('quality') || lower.includes('tell if')) {
      return {
        text: `${info.emoji} **How to Identify Fresh ${mentionedFruit}**\n\n` +
          `✅ **Look for:**\n${info.freshIndicators.map((i) => `• ${i}`).join('\n')}\n\n` +
          `⚠️ **Signs of spoilage:**\n${info.rottenIndicators.slice(0, 3).map((i) => `• ${i}`).join('\n')}`,
        type: 'quality',
      };
    }

    // Rotten / spoiled / bad
    if (lower.includes('rotten') || lower.includes('spoil') || lower.includes('bad') || lower.includes('decay') || lower.includes('expired')) {
      return {
        text: `${info.emoji} **Signs of Rotten ${mentionedFruit}**\n\n` +
          `🚫 **Warning Signs:**\n${info.rottenIndicators.map((i) => `• ${i}`).join('\n')}\n\n` +
          `🔬 **Common Defects:** ${info.commonDefects.join(', ')}\n\n` +
          `📉 **Compression Force (Rotten):** ${info.avgCompressionForce.rotten} kN\n` +
          `(Fresh averages ${info.avgCompressionForce.fresh} kN — ${Math.round(((info.avgCompressionForce.fresh - info.avgCompressionForce.rotten) / info.avgCompressionForce.fresh) * 100)}% stronger)`,
        type: 'rotten',
      };
    }

    // Temperature
    if (lower.includes('temp') || lower.includes('cold') || lower.includes('fridge') || lower.includes('refriger')) {
      return {
        text: `${info.emoji} **${mentionedFruit} Temperature Guide**\n\n` +
          `🌡️ **Storage Temp:** ${info.storageTemp}\n` +
          `💧 **Humidity:** ${info.humidity}\n` +
          `🍃 **Ethylene Producer:** ${info.ethyleneProducer ? 'Yes ⚠️' : 'No'}\n` +
          `📡 **Ethylene Sensitive:** ${info.ethyleneSensitive ? 'Yes ⚠️' : 'No'}\n\n` +
          (info.ethyleneProducer ? `⚠️ Keep away from ethylene-sensitive produce!` : ''),
        type: 'temperature',
      };
    }

    // Dataset / data / model
    if (lower.includes('dataset') || lower.includes('data') || lower.includes('model') || lower.includes('training') || lower.includes('image')) {
      const s = info.datasetStats;
      return {
        text: `${info.emoji} **${mentionedFruit} in Our Dataset**\n\n` +
          `📸 **Total Images:** ${s.totalImages.toLocaleString()}\n` +
          `✅ **Fresh Samples:** ${s.freshImages.toLocaleString()}\n` +
          `⚠️ **Rotten Samples:** ${s.rottenImages.toLocaleString()}\n` +
          `🔬 **Tactile Tests:** ${s.tactileSamples} samples\n\n` +
          `**Compression Analysis:**\n` +
          `• Fresh avg force: ${info.avgCompressionForce.fresh} kN\n` +
          `• Rotten avg force: ${info.avgCompressionForce.rotten} kN\n` +
          `• Fresh peak range: ${info.peakForceRange.fresh}\n` +
          `• Rotten peak range: ${info.peakForceRange.rotten}`,
        type: 'dataset',
      };
    }

    // General info about the fruit
    return {
      text: `${info.emoji} **${mentionedFruit}** (${info.scientificName})\n\n` +
        `🏷️ **Family:** ${info.family}\n` +
        `📂 **Category:** ${info.category}\n` +
        `📅 **Shelf Life:** ${info.shelfLife.fresh.label}\n` +
        `🌡️ **Storage:** ${info.storageTemp}\n` +
        `🔥 **Calories:** ${info.caloriesPer100g}/100g\n` +
        `💧 **Water Content:** ${info.nutritionalInfo.water}\n` +
        `📸 **Dataset:** ${info.datasetStats.totalImages.toLocaleString()} images\n\n` +
        `**Ask me about:**\n• Nutrition & health benefits\n• Storage & shelf life\n• Quality identification\n• Signs of spoilage\n• Dataset & model info`,
      type: 'general',
    };
  }

  // General questions
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
    return {
      text: `👋 **Hello! I'm FruitSense AI Assistant.**\n\n` +
        `I can help you with:\n` +
        `🍎 **Fruit info** — nutrition, shelf life, storage\n` +
        `🔬 **Quality checks** — how to identify fresh vs rotten\n` +
        `📊 **Dataset details** — training data & model info\n` +
        `⚖️ **Comparisons** — compare two fruits\n\n` +
        `**Try asking:**\n• "How long can I store mangoes?"\n• "Nutrition info for banana"\n• "Compare apple vs orange"\n• "Signs of rotten mango"`,
      type: 'greeting',
    };
  }

  if (lower.includes('model') || lower.includes('architect') || lower.includes('how does') || lower.includes('neural') || lower.includes('accuracy')) {
    return {
      text: `🧠 **FruitSense AI Model**\n\n` +
        `**Architecture:** MobileNetV2 + Custom Head\n` +
        `**Parameters:** ~4.38M (330K trainable)\n` +
        `**Input:** 224×224×3 RGB images\n` +
        `**Output:** 10 classes (5 fruits × Fresh/Rotten)\n` +
        `**Accuracy:** 96%+ validation\n` +
        `**Training Data:** 18,000+ images\n` +
        `**Tactile Data:** 5,987 samples\n\n` +
        `The model uses transfer learning from ImageNet and fine-tunes the top 30 layers for fruit-specific features.`,
      type: 'model',
    };
  }

  if (lower.includes('what') && (lower.includes('fruit') || lower.includes('support') || lower.includes('detect'))) {
    return {
      text: `🍎 **Supported Fruits & Vegetables**\n\n` +
        Object.entries(fruitKnowledge).map(([name, info]) => 
          `${info.emoji} **${name}** — ${info.category} (${info.datasetStats.totalImages} images)`
        ).join('\n') +
        `\n\n**Total:** 18,000+ images across all classes`,
      type: 'list',
    };
  }

  return {
    text: `I'm not sure about that! 🤔\n\n**Try asking me about:**\n` +
      `• A specific fruit: *"Tell me about mangoes"*\n` +
      `• Storage: *"How to store apples?"*\n` +
      `• Nutrition: *"Banana calories"*\n` +
      `• Quality: *"Signs of rotten orange"*\n` +
      `• Compare: *"Compare apple vs banana"*\n` +
      `• Model: *"How does the AI work?"*`,
    type: 'fallback',
  };
};

const formatMessage = (text) => {
  // Simple markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `👋 **Hi! I'm FruitSense AI.**\n\nAsk me anything about fruits, quality, storage, nutrition, or our dataset!\n\n**Quick start:** tap a suggestion below 👇`,
      type: 'greeting',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const idCounter = useRef(2);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (text) => {
    const message = text || inputValue.trim();
    if (!message) return;

    // Add user message
    const userMsgId = idCounter.current++;
    const userMsg = { id: userMsgId, sender: 'user', text: message };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate thinking delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const response = generateResponse(message);
    const botMsgId = idCounter.current++;
    const botMsg = { id: botMsgId, sender: 'bot', text: response.text, type: response.type };
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
          isOpen
            ? 'bg-white/10 hover:bg-white/15 rotate-0'
            : 'bg-green-500 hover:bg-green-400 hover:shadow-[0_0_30px_-6px_rgba(34,197,94,0.5)]'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <MessageCircle className="w-5 h-5 text-black" />
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-140px)] rounded-3xl glass-strong glow-green-sm flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center">
              <Bot className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">FruitSense AI</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">Always online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl hover:bg-white/[0.06] flex items-center justify-center transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-green-400" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-green-500 text-black rounded-br-md'
                      : 'bg-white/[0.05] text-gray-300 rounded-bl-md'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                />
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-green-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.05]">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex-shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.slice(0, 4).map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSend(reply)}
                    className="px-3 py-1.5 rounded-xl text-xs text-gray-400 bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/[0.06] transition-colors text-left"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2 bg-white/[0.04] rounded-2xl px-4 py-2.5 ring-1 ring-white/[0.06] focus-within:ring-green-500/30 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any fruit..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="w-8 h-8 rounded-xl bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:opacity-50 flex items-center justify-center transition-all"
              >
                <Send className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
