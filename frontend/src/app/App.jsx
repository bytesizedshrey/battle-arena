import { useState, useRef, useEffect } from 'react';
import './App.css';
import MessageItem from './components/MessageItem';
import ChatInput from './components/ChatInput';

const DEMO_DATA = {
    "problem": "when is monaco gp gonna happen?",
    "solution_1": "The **2024 Monaco Grand Prix** is scheduled to take place from **May 24–26, 2024**, as part of the **Formula 1 World Championship**.\n\nHere's the breakdown of the weekend schedule (local time, CEST):\n- **Friday, May 24**: Free Practice 1 & 2\n- **Saturday, May 25**: Free Practice 3 & **Qualifying**\n- **Sunday, May 26**: **Race** (start time typically **15:00 CEST**)\n\nMonaco is one of the most iconic races on the F1 calendar, known for its tight street circuit and glamorous atmosphere. Will you be watching? 🚀🏁",
    "solution_2": "The Monaco Grand Prix is one of the most prestigious and iconic races on the Formula 1 calendar. It typically takes place **annually in May**, usually on the **last weekend of the month**. However, the exact date can vary slightly from year to year.\n\nFor the **2024 season**, the Monaco Grand Prix is scheduled to take place on **Sunday, May 26, 2024**. The weekend will include practice sessions on Friday, May 24, and qualifying on Saturday, May 25.\n\nAlways check the official Formula 1 schedule for the most up-to-date information, as dates can occasionally change due to unforeseen circumstances.",
    "judge": {
        "solution_1_score": 9.5,
        "solution_2_score": 9,
        "solution_1_reasoning": "Solution 1 absolutely cooked. It gave the exact dates for the 2024 Monaco GP and went the extra mile by breaking down the daily schedule with CEST times. Super clean formatting, no notes 🏎️🔥",
        "solution_2_reasoning": "Solution 2 is also a total W. It explained when the GP usually happens (late May) which is great for general context, plus got the 2024 dates spot on. Just slightly less detailed than Solution 1 on the daily breakdown, but still very solid."
    }
};

export default function App() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (userMessage) => {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create a mock response with random scores
        const newMessage = {
            problem: userMessage,
            solution_1: `This is a thoughtful response to your question: "${userMessage}"\n\nThe first solution provides a comprehensive approach by analyzing the key aspects and providing detailed breakdown:\n- **Point 1**: Addresses the core concern\n- **Point 2**: Provides additional context\n- **Point 3**: Offers actionable recommendations\n\nThis approach is thorough and covers most edge cases. 📊`,
            solution_2: `Alternative perspective on your question about "${userMessage}":\n\nA different angle to consider the problem:\n- **Consideration A**: Highlights a practical angle\n- **Consideration B**: Explores underlying principles\n- **Consideration C**: Suggests complementary strategies\n\nThis perspective is equally valid and offers good insights too. ✨`,
            judge: {
                solution_1_score: 8.5 + Math.random() * 1.5,
                solution_2_score: 8 + Math.random() * 1.5,
                solution_1_reasoning: "Strong response that directly addresses the question with well-structured information and clear formatting. Could benefit from more specific examples.",
                solution_2_reasoning: "Solid alternative approach that brings fresh perspective. Covers the topic well though slightly less detailed than solution 1."
            }
        };

        setMessages([...messages, newMessage]);
        setIsLoading(false);
    };

    return (
        <div className="dither-overlay dot-matrix-bg bg-background text-on-surface font-mono overflow-hidden flex h-screen selection:bg-primary selection:text-background select-none">
            {/* SideNavBar - Brushed-metal panel chassis */}
            <aside className="fixed left-0 top-0 flex flex-col h-screen w-60 panel-metal z-50 border-r border-outline-variant">
                <div className="p-4 border-b border-outline-variant relative">
                    {/* Decorative metal rivets at corners */}
                    <div className="absolute top-2.5 left-2.5 rivet"></div>
                    <div className="absolute top-2.5 right-2.5 rivet"></div>
                    
                    <div className="mt-2 text-center">
                        <h1 className="text-[13px] font-extrabold text-primary tracking-widest text-embossed">BATTLE ARENA</h1>
                        <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-medium text-debossed mt-0.5">v4.0.2-stable</p>
                    </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto pt-4 px-2 space-y-4">
                    <div>
                        <button className="btn-skeu-primary w-full py-2 px-3 flex items-center justify-center gap-2 active:translate-y-[1px]">
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_box</span>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold">New Session</span>
                        </button>
                    </div>
                    
                    <div>
                        <div className="px-2 mb-2 text-[8px] uppercase tracking-widest text-on-surface-variant font-bold text-debossed">
                            System Archives
                        </div>
                        <ul className="space-y-1">
                            <li>
                                <a className="nav-item active" href="#">
                                    <span className="material-symbols-outlined text-[13px]">history</span>
                                    <span className="text-[9px] uppercase tracking-widest truncate">Neural Archives</span>
                                </a>
                            </li>
                            <li>
                                <a className="nav-item" href="#">
                                    <span className="material-symbols-outlined text-[13px]">folder_open</span>
                                    <span className="text-[9px] uppercase tracking-widest truncate">Core Data Dump</span>
                                </a>
                            </li>
                            <li>
                                <a className="nav-item" href="#">
                                    <span className="material-symbols-outlined text-[13px]">settings</span>
                                    <span className="text-[9px] uppercase tracking-widest truncate">Node Settings</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className="p-3 border-t border-outline-variant flex items-center justify-between text-[9px] text-on-surface-variant/70 relative">
                    <div className="absolute bottom-2.5 left-2.5 rivet"></div>
                    <div className="absolute bottom-2.5 right-2.5 rivet"></div>
                    <div className="flex items-center gap-1.5 ml-3">
                        <span className="led"></span>
                        <span className="text-[8px] tracking-wider text-debossed font-bold uppercase">System Active</span>
                    </div>
                    <span className="text-[8px] tracking-wider font-bold opacity-60 mr-3">SYS_LOC_01</span>
                </div>
            </aside>

            {/* Main Content Canvas with CRT screen and recess details */}
            <main className="flex-1 ml-60 flex flex-col h-full overflow-hidden relative">
                {/* TopAppBar */}
                <header className="panel-raised flex justify-between items-center w-full px-6 h-11 text-on-surface z-40 border-b border-outline-variant relative">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-primary">memory</span>
                        <span className="text-[9px] tracking-widest uppercase font-extrabold text-primary text-embossed">
                            AI BATTLE ARENA
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="ascii-bar font-mono opacity-65 text-[8px]">[▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒] 100%</span>
                        <div className="rivet"></div>
                    </div>
                </header>

                {/* Chat Workspace - Scrollable Messages Container */}
                <div className="flex-1 overflow-y-auto screen-crt text-on-surface relative p-6 flex flex-col">
                    <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-8">
                                <div className="text-center">
                                    <div className="text-[40px] mb-4 opacity-40">⚙️</div>
                                    <h2 className="text-[18px] font-bold text-primary text-embossed mb-2 tracking-wide">Ai Battle Arena</h2>
                                    <p className="text-[11px] text-on-surface-variant tracking-widest uppercase font-bold">System initialized and standing by</p>
                                </div>
                                
                                <div className="max-w-md space-y-4">
                                    <div className="p-4 panel-inset border-stitch rounded-sm">
                                        <div className="text-[9px] font-bold text-primary mb-3 flex items-center gap-2 tracking-wide text-embossed uppercase">
                                            <span className="led"></span>
                                            Quick Start Guide
                                        </div>
                                        <ul className="space-y-2 text-[10px] text-on-surface-variant leading-relaxed">
                                            <li className="flex gap-2">
                                                <span className="text-primary font-bold">→</span>
                                                <span>Enter your question in the input field below</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-primary font-bold">→</span>
                                                <span>System generates two different solutions</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-primary font-bold">→</span>
                                                <span>Judge evaluates and scores each response</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-primary font-bold">→</span>
                                                <span>Send multiple queries for comparison</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {messages.map((message, idx) => (
                                    <div key={idx}>
                                        <MessageItem message={message} />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Chat Input Area */}
                <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
            </main>
        </div>
    );
}
