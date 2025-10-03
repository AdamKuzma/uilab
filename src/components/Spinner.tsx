import { clsx } from "clsx";
import "./Spinner.css";

const bars = Array(12).fill(0);

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 20,
  color = '#ffffff',
  className
}) => {
  return (
    <div
      className={clsx("wrapper", className)}
      style={{
        ["--spinner-size"]: `${size}px`,
        ["--spinner-color"]: color,
      } as React.CSSProperties}
    >
      <div className="spinner">
        {bars.map((_, i) => (
          <div className="bar" key={`spinner-bar-${i}`} />
        ))}
      </div>
    </div>
  );
};