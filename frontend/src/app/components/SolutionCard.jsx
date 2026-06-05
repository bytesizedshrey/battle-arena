function parseInlineMarkdown(text) {
    const parts = text.split('**');
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return <strong key={index} className="text-primary font-bold text-embossed">{part}</strong>;
        }
        return part;
    });
}

function renderMarkdown(text) {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ')) {
            return (
                <li key={idx} className="ml-4 list-disc mb-1 pl-1 text-[11px] leading-relaxed">
                    {parseInlineMarkdown(trimmed.substring(2))}
                </li>
            );
        }
        if (!trimmed) {
            return <div key={idx} className="h-2" />;
        }
        return (
            <p key={idx} className="mb-1.5 text-[11px] leading-relaxed">
                {parseInlineMarkdown(line)}
            </p>
        );
    });
}

export default function SolutionCard({ number, content }) {
    return (
        <div className="solution-card p-4 rounded-sm flex flex-col relative">
            <div className="flex items-center justify-between mb-3 border-b border-outline-variant pb-2">
                <span className="section-label">[ SOLUTION_{String(number).padStart(2, '0')} ]</span>
                <span className="text-[8px] uppercase tracking-widest text-on-surface-variant/50">Output Stream {number}</span>
            </div>
            <div className="prose-terminal text-on-surface-variant font-mono text-[10.5px]">
                {renderMarkdown(content)}
            </div>
        </div>
    );
}
