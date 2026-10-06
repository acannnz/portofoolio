import React from 'react';

const POSITIONS = {
    tl: 'top-0 left-0 border-t-2 border-l-2',
    tr: 'top-0 right-0 border-t-2 border-r-2',
    bl: 'bottom-0 left-0 border-b-2 border-l-2',
    br: 'bottom-0 right-0 border-b-2 border-r-2',
};

export default function CornerBrackets({
    corners = ['tl', 'tr', 'bl', 'br'],
    size = 'w-3 h-3',
    color = 'border-cyan-400',
}) {
    return corners.map((corner) => (
        <div
            key={corner}
            aria-hidden="true"
            className={`absolute ${size} ${color} ${POSITIONS[corner]} pointer-events-none`}
        />
    ));
}
