import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function HintPill({ children }) {
    return (
        <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-md flex items-center gap-2 text-xs font-mono text-cyan-300 shadow-xl">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>{children}</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce text-cyan-400" aria-hidden="true" />
            </div>
        </div>
    );
}
