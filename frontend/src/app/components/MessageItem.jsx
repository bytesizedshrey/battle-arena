import SolutionCard from './SolutionCard';
import JudgePanel from './JudgePanel';

export default function MessageItem({ message }) {
    return (
        <div className="message-item">
            {/* User Message */}
            <div className="flex gap-4 items-start mb-6">
                {/* Raised badge for User avatar */}
                <div className="flex-none w-7 h-7 panel-raised flex items-center justify-center font-bold text-[9px] text-primary rounded-sm shadow-sm select-none border border-outline text-embossed">
                    [U]
                </div>
                
                {/* Inset panel for the User Input */}
                <div className="flex-1 p-4 panel-inset border-stitch rounded-sm">
                    <div className="section-label mb-2">[ USER_INPUT ]</div>
                    <div className="text-[11px] text-primary tracking-wide leading-relaxed">
                        {message.problem}
                    </div>
                </div>
            </div>

            {/* Response Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <SolutionCard number={1} content={message.solution_1} />
                <SolutionCard number={2} content={message.solution_2} />
            </div>

            {/* Judge Recommendation */}
            <JudgePanel judgeData={message.judge} />

            {/* Divider between messages */}
            <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-outline-variant via-outline-variant to-transparent"></div>
                <span className="text-[8px] uppercase tracking-widest text-on-surface-variant/40 font-bold">─────</span>
                <div className="flex-1 h-px bg-gradient-to-l from-outline-variant via-outline-variant to-transparent"></div>
            </div>
        </div>
    );
}
