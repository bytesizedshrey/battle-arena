import { useState } from 'react';

export default function ChatInput({ onSendMessage, disabled }) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || disabled || isLoading) return;

        setIsLoading(true);
        // Call the parent handler
        onSendMessage(input);
        setInput('');
        setIsLoading(false);
    };

    const handleKeyDown = (e) => {
        // Send on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 border-t border-outline-variant bg-surface relative">
            <div className="max-w-4xl mx-auto flex gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter your question..."
                        disabled={disabled || isLoading}
                        className="input-terminal w-full"
                    />
                    <div className="text-[8px] text-on-surface-variant/50 mt-2 tracking-widest uppercase font-bold">
                        ⌘ + Enter to send
                    </div>
                </div>
                
                <button
                    type="submit"
                    disabled={!input.trim() || disabled || isLoading}
                    className="btn-skeu-primary px-6 py-2 flex-shrink-0 h-fit disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-[11px] uppercase tracking-wider font-bold">
                        {isLoading ? 'Processing...' : 'Send'}
                    </span>
                </button>
            </div>
        </form>
    );
}
