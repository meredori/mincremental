import React from 'react';
import './tooltip.css';

const Tooltip = ({ children, content }) => {
    return (
        <div className="tooltip-wrapper">
            <div className="tooltip-trigger">
                {children}
            </div>
            <div className="tooltip-content">
                {content}
            </div>
        </div>
    );
};

export default Tooltip;