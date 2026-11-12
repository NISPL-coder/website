import React from 'react';

/**
 * Clean SVG circular progress indicator showing profile completion percentage.
 */
export default function ProfileCompletionCircle({
  percentage = 0,
  size = 36,
  strokeWidth = 3,
  showPercentageInside = true,
  className = '',
  onClick = null,
  title = null
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, Number(percentage) || 0));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Adaptive color based on completion tier
  const strokeColor =
    clamped === 100
      ? '#10b981' // emerald
      : clamped >= 60
      ? '#6366f1' // indigo
      : '#f59e0b'; // amber

  const defaultTitle = `Profile ${clamped}% completed`;

  return (
    <div
      className={`profile-completion-circle-wrap ${className}`}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
      title={title || defaultTitle}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease'
          }}
        />
      </svg>

      {showPercentageInside && (
        <span
          style={{
            position: 'absolute',
            fontSize: size <= 28 ? '0.62rem' : size <= 36 ? '0.68rem' : '0.8rem',
            fontWeight: 800,
            color: strokeColor,
            fontFamily: 'inherit',
            lineHeight: 1,
            letterSpacing: '-0.3px',
            userSelect: 'none'
          }}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
}

