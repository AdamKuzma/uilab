import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 20, 
  color = '#000000',
  className = ''
}) => {
  const style = {
    '--spinner-size': `${size}px`,
    '--spinner-color': color,
  } as React.CSSProperties;

  return (
    <div className={`wrapper ${className}`} style={style}>
      <div className="spinner">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="bar" />
        ))}
      </div>
    </div>
  );
};