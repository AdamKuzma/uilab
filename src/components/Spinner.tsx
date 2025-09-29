import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 20,
  color = '#ffffff',
  className = ''
}) => {
  const radius = size / 2;
  const barLength = size * 0.26;
  const barWidth = Math.max(1, size * 0.1);
  
  return (
    <div 
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-block'
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) * (Math.PI / 180);
        const x = radius + Math.cos(angle - Math.PI / 2) * (radius - barLength / 2);
        const y = radius + Math.sin(angle - Math.PI / 2) * (radius - barLength / 2);
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - barWidth / 2,
              top: y - barLength / 2,
              width: barWidth,
              height: barLength,
              backgroundColor: color,
              borderRadius: barWidth / 2,
              transformOrigin: `${barWidth / 2}px ${barLength / 2}px`,
              transform: `rotate(${i * 30}deg)`,
              opacity: 1 - (i * 0.08),
              animation: `spinner-fade 0.6s linear infinite`,
              animationDelay: `${-0.6 + (i * 0.05)}s`
            }}
          />
        );
      })}
    </div>
  );
};