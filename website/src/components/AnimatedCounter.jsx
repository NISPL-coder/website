import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedCounter component
 * Smoothly animates numbers from start (1/0) to the target number
 * with easing, comma formatting, prefix/suffix support, and viewport trigger.
 */
export default function AnimatedCounter({
  value,
  end: propEnd,
  start: propStart,
  duration = 2000,
  prefix: propPrefix,
  suffix: propSuffix,
  decimals: propDecimals,
  className = ''
}) {
  // Parse string values if passed via `value` (e.g. "2,500+", "99.8%", "26+ Yrs")
  let end = typeof propEnd === 'number' ? propEnd : 0;
  let decimals = typeof propDecimals === 'number' ? propDecimals : 0;
  let prefix = propPrefix || '';
  let suffix = propSuffix || '';

  if (value !== undefined) {
    const parsed = parseValue(value);
    if (propEnd === undefined) end = parsed.end;
    if (propDecimals === undefined) decimals = parsed.decimals;
    if (propPrefix === undefined) prefix = parsed.prefix;
    if (propSuffix === undefined) suffix = parsed.suffix;
  }

  const start = typeof propStart === 'number' ? propStart : (end >= 10 ? 1 : 0);
  const [displayValue, setDisplayValue] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  // Trigger animation when scrolled into view
  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Run smooth animation frame counter
  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    let animationFrameId = null;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const current = start + (end - start) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [hasStarted, start, end, duration]);

  return (
    <span ref={elementRef} className={`nis-animated-counter ${className}`}>
      {prefix}
      {formatNumber(displayValue, decimals)}
      {suffix}
    </span>
  );
}

function parseValue(val) {
  if (typeof val === 'number') {
    return { end: val, decimals: 0, prefix: '', suffix: '' };
  }
  const str = String(val).trim();
  const match = str.match(/^([^\d.]*)(\d+(?:\.\d+)?|\d{1,3}(?:,\d{3})*(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { end: 0, decimals: 0, prefix: '', suffix: str };
  }
  const prefix = match[1] || '';
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3] || '';
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const end = parseFloat(numStr) || 0;
  return { end, decimals, prefix, suffix };
}

function formatNumber(val, decimals) {
  if (decimals > 0) {
    const fixed = val.toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    const formattedInt = Math.floor(Number(intPart)).toLocaleString('en-US');
    return `${formattedInt}.${decPart}`;
  }
  return Math.floor(val).toLocaleString('en-US');
}
