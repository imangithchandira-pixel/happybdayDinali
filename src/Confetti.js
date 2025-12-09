import React, { useEffect } from "react";
import "./App.css";

export default function Confetti({ pieces = 30, duration = 8000, onDone }) {
  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(() => onDone(), duration);
    return () => clearTimeout(t);
  }, [duration, onDone]);

  const colors = ["#ff3b30", "#ff9500", "#ffcc00", "#4cd964", "#5ac8fa", "#007aff", "#5856d6"];

  return (
    <div className="confetti-root" aria-hidden>
      {Array.from({ length: pieces }).map((_, i) => {
        const left = Math.round(Math.random() * 100);
        const delay = Math.random() * 2;
        const dur = 3 + Math.random() * 3; // 3-6s
        const color = colors[i % colors.length];
        const size = 6 + Math.round(Math.random() * 10);
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
              backgroundColor: color,
              width: `${size}px`,
              height: `${size * 0.6}px`,
              transform: `rotate(${Math.round(Math.random() * 360)}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
