import React, { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for smooth count-up animation from 0 to a target number.
 * Uses requestAnimationFrame with easeOutExpo easing.
 */
export function useCountUp(endVal, duration = 1600, decimals = 0, delay = 100) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = typeof endVal === 'number' ? endVal : parseFloat(String(endVal).replace(/[^0-9.-]/g, '')) || 0;
    startTimeRef.current = null;

    const timer = setTimeout(() => {
      const step = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

        // Ease Out Expo: 1 - 2^(-10 * progress)
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = easeProgress * target;

        setCount(currentVal);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setCount(target);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [endVal, duration, delay]);

  const formatted = decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString();
  return { value: count, formatted };
}

/**
 * CountUp Component for rendering animated numbers inline.
 */
export function CountUp({
  end,
  start = 0,
  duration = 1500,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className = ''
}) {
  const [displayValue, setDisplayValue] = useState(start);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = typeof end === 'number' ? end : parseFloat(String(end).replace(/[^0-9.-]/g, '')) || 0;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth Ease Out Quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = start + (target - start) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, start, duration]);

  const formatNumber = (num) => {
    if (decimals > 0) {
      const fixed = num.toFixed(decimals);
      if (separator) {
        const parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        return parts.join('.');
      }
      return fixed;
    }
    const rounded = Math.round(num);
    return separator ? rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator) : rounded.toString();
  };

  return (
    <span className={`count-up-animated ${className}`}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}

export default CountUp;
