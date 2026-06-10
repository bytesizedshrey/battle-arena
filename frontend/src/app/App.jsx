import { useState, useEffect, useRef } from 'react';
import { 
  Play, Cpu, Activity, History, Copy, Check, Terminal, 
  Sparkles, Brain, RefreshCw, Layers, CheckCircle2, XCircle, ChevronRight 
} from 'lucide-react';
import './App.css';
import { DotmSquare10 } from "@/components/ui/dotm-square-10";
import { DotmSquare3 } from "@/components/ui/dotm-square-3";

const PRESET_PROMPTS = [
  "when is monaco gp gonna happen?",
  "REST vs GraphQL: which one should I use for a real-time chat app?",
  "Explain quantum computing to a 10 year old with a fun analogy 🚀",
  "Write a high-performance binary search algorithm in Rust"
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [activeMessage, setActiveMessage] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [backendStatus, setBackendStatus] = useState({
    status: 'checking',
    keys: { google: false, mistral: false, cohere: false }
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check backend connection and keys on mount
    const checkStatus = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/status');
        if (res.ok) {
          const data = await res.json();
          setBackendStatus(data);
        } else {
          setBackendStatus({ status: 'offline', keys: { google: false, mistral: false, cohere: false } });
        }
      } catch (err) {
        console.error('Failed to fetch backend status:', err);
        setBackendStatus({ status: 'offline', keys: { google: false, mistral: false, cohere: false } });
      }
    };
    checkStatus();
  }, []);

  const handleSendMessage = async (promptText) => {
    const textToSubmit = promptText || input;
    if (!textToSubmit.trim() || isLoading) return;

    setIsLoading(true);
    setInput('');

    // Create a temporary message with loading state
    const tempMessage = {
      problem: textToSubmit,
      solution_1: '',
      solution_2: '',
      judge: null,
      loading: true
    };
    
    // Add to list and select as active
    const updatedMessages = [...messages, tempMessage];
    setMessages(updatedMessages);
    setActiveMessage(tempMessage);

    try {
      const response = await fetch('http://localhost:3000/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: textToSubmit })
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      
      // Update the temp message with real data
      const finalMessage = {
        problem: textToSubmit,
        solution_1: data.solution_1 || 'No solution generated.',
        solution_2: data.solution_2 || 'No solution generated.',
        judge: data.judge || {
          solution_1_score: 0,
          solution_2_score: 0,
          solution_1_reasoning: 'Evaluation failed.',
          solution_2_reasoning: 'Evaluation failed.'
        },
        loading: false
      };

      setMessages(prev => prev.map(m => m.problem === textToSubmit ? finalMessage : m));
      setActiveMessage(finalMessage);
    } catch (error) {
      console.error('API Error:', error);
      // Fallback local mockup if backend is completely down
      const score1 = 7.0 + Math.random() * 2.5;
      const score2 = 6.5 + Math.random() * 3.0;
      const errMessage = {
        problem: textToSubmit,
        solution_1: `**[OFFLINE SIMULATION - MISTRAL]**\nFailed to reach the backend at port 3000.\nHere is a local mock solution for: "${textToSubmit}"\n\n1. **Core Concept**: Verify that your backend server is running via \`npm run dev\` at the root.\n2. **Strategy**: Make sure port 3000 is open and not blocked by another process.\n3. **Recommendation**: Check your terminal logs for any compilation errors.`,
        solution_2: `**[OFFLINE SIMULATION - COHERE]**\nConnection to backend refused.\n\n- **Analysis**: The backend Express server must be online to execute LangGraph flow.\n- **Approach**: Restart the server and try again.\n- **Next Steps**: Validate API keys in your .env file.`,
        judge: {
          solution_1_score: parseFloat(score1.toFixed(1)),
          solution_2_score: parseFloat(score2.toFixed(1)),
          solution_1_reasoning: "Local mockup triggered. Connection to backend failed 💀",
          solution_2_reasoning: "Please start the backend server to run the actual model logic!"
        },
        loading: false
      };
      setMessages(prev => prev.map(m => m.problem === textToSubmit ? errMessage : m));
      setActiveMessage(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parseMarkdownBold = (text) => {
    if (!text) return '';
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-zinc-50 font-bold">{part}</strong>;
      }
      return part;
    });
  };

  const renderTextContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc mb-1.5 pl-1 text-[11px] text-zinc-300">
            {parseMarkdownBold(trimmed.substring(2))}
          </li>
        );
      }
      if (trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc mb-1.5 pl-1 text-[11px] text-zinc-300">
            {parseMarkdownBold(trimmed.substring(2))}
          </li>
        );
      }
      if (trimmed.match(/^\d+\.\s/)) {
        const dotIndex = trimmed.indexOf('.');
        return (
          <li key={idx} className="ml-4 list-decimal mb-1.5 pl-1 text-[11px] text-zinc-300">
            {parseMarkdownBold(trimmed.substring(dotIndex + 1).trim())}
          </li>
        );
      }
      if (!trimmed) {
        return <div key={idx} className="h-3" />;
      }
      return (
        <p key={idx} className="mb-2.5 text-[11px] text-zinc-300 leading-relaxed">
          {parseMarkdownBold(line)}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-200 p-4 md:p-6 lg:p-8 flex flex-col items-center">
      {/* Top Banner / Navigation */}
      <header className="w-full max-w-[1400px] mb-6 flex justify-between items-center border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg">
            <Layers className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-white font-mono uppercase">BATTLE ARENA</h1>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-medium">Model Comparison Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-2 bg-[#09090b] border border-zinc-900 px-3 py-1.5 rounded-lg">
            <span className={`w-2 h-2 rounded-full ${backendStatus.status === 'online' ? 'bg-zinc-400 led-status' : 'bg-red-900'} `}></span>
            <span className="text-zinc-400 uppercase tracking-widest">
              SYS STATUS: {backendStatus.status.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Bento Grid */}
      <div className="w-full max-w-[1400px] bento-grid">
        
        {/* Box 1: Prompt Input Area (Col span 8) */}
        <section className="bento-card col-span-12 lg:col-span-8 flex flex-col justify-between min-h-[200px]">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs tracking-wider text-zinc-400 font-bold uppercase border-b border-zinc-900 pb-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>Input Control Console</span>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mt-2">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask a question for the arena to solve..."
                  disabled={isLoading}
                  rows={2}
                  className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-4 py-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-700 transition duration-200 resize-none font-mono"
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-[9px] text-zinc-500 tracking-wider">⌘ + ENTER TO DEPLOY</span>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-950 text-zinc-950 rounded-lg text-xs font-bold font-mono transition duration-150 border border-zinc-800 uppercase tracking-wider"
                >
                  {isLoading ? 'Processing' : 'Deploy'}
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            </form>
          </div>
          
          {/* Quick presets */}
          <div className="mt-4 border-t border-zinc-900 pt-3">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-2 font-bold">Standard Presets:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(p)}
                  disabled={isLoading}
                  className="text-[10px] bg-[#050505] hover:bg-[#0f0f11] text-zinc-400 hover:text-zinc-200 border border-zinc-900 px-3 py-1.5 rounded-md transition font-mono truncate max-w-xs"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Box 2: Monitor / Registry (Col span 4) */}
        <section className="bento-card col-span-12 lg:col-span-4 flex flex-col justify-between min-h-[200px]">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 text-xs tracking-wider text-zinc-400 font-bold uppercase border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                <span>System Registry</span>
              </div>
              <span className="text-[9px] text-zinc-600">v4.1.0</span>
            </div>
            
            {/* API Key badges */}
            <div className="space-y-2.5 mt-4">
              <div className="flex justify-between items-center bg-[#050505] border border-zinc-900 p-2 rounded-lg">
                <span className="text-[10px] text-zinc-400 font-mono">GOOGLE_API_KEY</span>
                {backendStatus.keys.google ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-zinc-700" />
                )}
              </div>
              <div className="flex justify-between items-center bg-[#050505] border border-zinc-900 p-2 rounded-lg">
                <span className="text-[10px] text-zinc-400 font-mono">MISTRAL_API_KEY</span>
                {backendStatus.keys.mistral ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-zinc-700" />
                )}
              </div>
              <div className="flex justify-between items-center bg-[#050505] border border-zinc-900 p-2 rounded-lg">
                <span className="text-[10px] text-zinc-400 font-mono">COHERE_API_KEY</span>
                {backendStatus.keys.cohere ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-zinc-700" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-4">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Active Pulse</span>
            {isLoading ? (
              <DotmSquare3 size={32} dotSize={4} speed={2} className="text-zinc-300" />
            ) : (
              <DotmSquare3 size={32} dotSize={4} animated={false} className="text-zinc-700" />
            )}
          </div>
        </section>

        {/* Box 3: Sessions / History list (Col span 4) */}
        <section className="bento-card col-span-12 lg:col-span-4 lg:row-span-2 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs tracking-wider text-zinc-400 font-bold uppercase border-b border-zinc-900 pb-2">
              <History className="w-3.5 h-3.5" />
              <span>Neural Archives</span>
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1 mt-3">
              {messages.length === 0 ? (
                <p className="text-[10px] text-zinc-600 font-mono italic text-center py-8">No session archives.</p>
              ) : (
                messages.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveMessage(m)}
                    className={`w-full text-left p-3 rounded-lg border transition duration-200 font-mono flex items-center justify-between ${
                      activeMessage?.problem === m.problem 
                        ? 'bg-[#0f0f11] border-zinc-700 text-zinc-100' 
                        : 'bg-[#050505] border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="text-[9px] text-zinc-600 block mb-0.5 uppercase tracking-wider">
                        SESSION {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] truncate block">{m.problem}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
          
          <button
            onClick={() => { setMessages([]); setActiveMessage(null); }}
            disabled={messages.length === 0}
            className="w-full flex items-center justify-center gap-2 py-2 bg-transparent hover:bg-zinc-950 disabled:opacity-30 border border-zinc-900 hover:border-zinc-800 rounded-lg text-[10px] text-zinc-400 font-bold uppercase tracking-wider transition"
          >
            Clear Archives
          </button>
        </section>

        {/* Box 4: Solution 1 (Col span 4, tall) */}
        <section className="bento-card col-span-12 md:col-span-6 lg:col-span-4 min-h-[350px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Solution_01</span>
              </div>
              <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-zinc-850 px-2 py-0.5 rounded uppercase font-mono tracking-widest">
                Mistral Medium
              </span>
            </div>

            {activeMessage ? (
              activeMessage.loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <DotmSquare10 size={36} dotSize={5} speed={2.5} className="text-zinc-500" />
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mt-4">Generating Solution</span>
                </div>
              ) : (
                <div className="prose-custom text-[11px] text-zinc-300 font-mono max-h-[350px] overflow-y-auto pr-1">
                  {renderTextContent(activeMessage.solution_1)}
                </div>
              )
            ) : (
              <p className="text-[10px] text-zinc-600 font-mono italic py-20 text-center">Standing by for battle...</p>
            )}
          </div>

          {activeMessage && !activeMessage.loading && activeMessage.solution_1 && (
            <div className="border-t border-zinc-900 pt-3 flex justify-between items-center">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Length: {activeMessage.solution_1.length} chars</span>
              <button
                onClick={() => copyToClipboard(activeMessage.solution_1, 1)}
                className="p-1.5 hover:bg-zinc-900 rounded-md transition text-zinc-400 hover:text-zinc-200"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </section>

        {/* Box 5: Solution 2 (Col span 4, tall) */}
        <section className="bento-card col-span-12 md:col-span-6 lg:col-span-4 min-h-[350px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Solution_02</span>
              </div>
              <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-zinc-850 px-2 py-0.5 rounded uppercase font-mono tracking-widest">
                Cohere Command
              </span>
            </div>

            {activeMessage ? (
              activeMessage.loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <DotmSquare10 size={36} dotSize={5} speed={2.5} className="text-zinc-500" />
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest mt-4">Generating Solution</span>
                </div>
              ) : (
                <div className="prose-custom text-[11px] text-zinc-300 font-mono max-h-[350px] overflow-y-auto pr-1">
                  {renderTextContent(activeMessage.solution_2)}
                </div>
              )
            ) : (
              <p className="text-[10px] text-zinc-600 font-mono italic py-20 text-center">Standing by for battle...</p>
            )}
          </div>

          {activeMessage && !activeMessage.loading && activeMessage.solution_2 && (
            <div className="border-t border-zinc-900 pt-3 flex justify-between items-center">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Length: {activeMessage.solution_2.length} chars</span>
              <button
                onClick={() => copyToClipboard(activeMessage.solution_2, 2)}
                className="p-1.5 hover:bg-zinc-900 rounded-md transition text-zinc-400 hover:text-zinc-200"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </section>

        {/* Box 6: Judge Evaluation & Commentary (Col span 12 or 8 depending on layout) */}
        <section className="bento-card col-span-12 lg:col-span-8 min-h-[200px]">
          <div className="flex items-center gap-2 mb-3 text-xs tracking-wider text-zinc-400 font-bold uppercase border-b border-zinc-900 pb-2">
            <Brain className="w-3.5 h-3.5 text-zinc-400" />
            <span>AI Judge Report (Gemini Flash)</span>
          </div>

          {activeMessage ? (
            activeMessage.loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="w-5 h-5 text-zinc-500 animate-spin" />
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest mt-4">Waiting for scores...</span>
              </div>
            ) : activeMessage.judge ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                {/* Scores section */}
                <div className="col-span-1 flex md:flex-col justify-center gap-3">
                  <div className="bg-[#050505] border border-zinc-900 p-3 rounded-xl text-center">
                    <span className="text-2xl font-bold tracking-tight text-white block">
                      {activeMessage.judge.solution_1_score.toFixed(1)}
                    </span>
                    <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">S_01 Score</span>
                  </div>
                  <div className="bg-[#050505] border border-zinc-900 p-3 rounded-xl text-center">
                    <span className="text-2xl font-bold tracking-tight text-zinc-400 block">
                      {activeMessage.judge.solution_2_score.toFixed(1)}
                    </span>
                    <span className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">S_02 Score</span>
                  </div>
                </div>

                {/* Commentary Details */}
                <div className="col-span-1 md:col-span-3 bg-[#050505] border border-zinc-900 p-4 rounded-xl flex flex-col justify-between">
                  <div className="space-y-3 font-mono text-[10px] text-zinc-400 leading-relaxed">
                    <div>
                      <strong className="text-white text-[9px] uppercase tracking-wider block mb-1">
                        Solution 1 Assessment:
                      </strong>
                      <p className="italic">"{activeMessage.judge.solution_1_reasoning}"</p>
                    </div>
                    <div className="h-px bg-zinc-900 my-2"></div>
                    <div>
                      <strong className="text-white text-[9px] uppercase tracking-wider block mb-1">
                        Solution 2 Assessment:
                      </strong>
                      <p className="italic">"{activeMessage.judge.solution_2_reasoning}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-zinc-600 font-mono italic py-10 text-center">No evaluation data available.</p>
            )
          ) : (
            <p className="text-[10px] text-zinc-600 font-mono italic py-12 text-center">Deploy a prompt to get an evaluation.</p>
          )}
        </section>

        {/* Box 7: System Information footer (Col span 4) */}
        <footer className="bento-card col-span-12 lg:col-span-4 flex flex-col justify-center items-center text-center p-6">
          <div className="flex items-center gap-1.5 text-zinc-600 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[9px] uppercase tracking-widest font-bold font-mono">Arena Mode Status</span>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono leading-relaxed max-w-xs">
            Deploying graph nodes. Judges are prompted to output neutral assessments with Gen Z commentary.
          </p>
        </footer>

      </div>
    </div>
  );
}
