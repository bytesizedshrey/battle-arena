export default function JudgePanel({ judgeData }) {
    return (
        <div className="relative p-5 panel-raised rounded-sm mt-4 border border-outline">
            {/* Decorative Corner Rivets */}
            <div className="absolute top-2 left-2 rivet"></div>
            <div className="absolute top-2 right-2 rivet"></div>
            <div className="absolute bottom-2 left-2 rivet"></div>
            <div className="absolute bottom-2 right-2 rivet"></div>
            
            <div className="absolute -top-2.5 left-6 section-label">
                JUDGE RECOMMENDATION & EVALUATION
            </div>
            
            <div className="flex flex-col md:flex-row items-stretch gap-6 pt-2 pb-1 px-1">
                {/* Score Gauges */}
                <div className="flex md:flex-col justify-center gap-3 flex-shrink-0">
                    <div className="score-gauge min-w-[76px]">
                        <div className="text-[18px] text-primary font-bold text-embossed">{judgeData.solution_1_score.toFixed(1)}</div>
                        <div className="text-[7.5px] uppercase tracking-wider text-on-surface-variant font-extrabold text-debossed">S_01 SCORE</div>
                    </div>
                    
                    <div className="score-gauge min-w-[76px]">
                        <div className="text-[18px] text-on-surface-variant font-bold text-debossed">{judgeData.solution_2_score.toFixed(1)}</div>
                        <div className="text-[7.5px] uppercase tracking-wider text-on-surface-variant font-extrabold text-debossed">S_02 SCORE</div>
                    </div>
                </div>
                
                {/* Reasoning Details Inset */}
                <div className="flex-1">
                    <div className="p-4 panel-inset border-stitch rounded-sm h-full">
                        <div className="text-[9px] font-bold text-primary mb-2.5 flex items-center gap-2 tracking-wide text-embossed">
                            <span className="led"></span>
                            EVALUATION REPORT
                        </div>
                        
                        <div className="space-y-3 font-mono text-[10.5px] leading-relaxed text-on-surface-variant">
                            <div>
                                <strong className="text-primary text-[9px] uppercase tracking-wider text-embossed block mb-1">
                                    Solution 1 Assessment:
                                </strong>
                                <p className="italic">{judgeData.solution_1_reasoning}</p>
                            </div>
                            
                            <div className="divider-metal my-2"></div>
                            
                            <div>
                                <strong className="text-primary text-[9px] uppercase tracking-wider text-embossed block mb-1">
                                    Solution 2 Assessment:
                                </strong>
                                <p className="italic">{judgeData.solution_2_reasoning}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
