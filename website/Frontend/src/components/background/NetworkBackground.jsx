import React, { useEffect, useRef } from 'react';
import './NetworkBackground.css';

/**
 * NetworkBackground
 * 
 * Interactive Constellation Network Background with scroll-reactive parallax physics.
 * Recreates the clean slate/navy interconnected node mesh from the design reference.
 * Strictly positioned at z-index: 0 beneath all page carousels, videos, images, and content.
 */
export default function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Track scroll positions for multi-depth parallax
    let scrollY = window.scrollY || window.pageYOffset || 0;
    let targetScrollY = scrollY;
    let lastScrollY = scrollY;
    let scrollVelocity = 0;

    // Node particle system
    let particles = [];
    const MAX_DISTANCE = 150;
    const MAX_CONNECTIONS_PER_NODE = 4;

    const createParticles = () => {
      // Density calculation: lightweight on mobile (~1 node per 32,000 px^2), rich on desktop
      const isMobile = width < 768;
      const count = isMobile 
        ? Math.max(14, Math.min(24, Math.floor((width * height) / 32000)))
        : Math.max(35, Math.min(85, Math.floor((width * height) / 18500)));
      particles = [];

      for (let i = 0; i < count; i++) {
        // Varying sizes: 10% large, 30% medium, 45% small, 15% tiny (matching reference image)
        const sizeRand = Math.random();
        let radius;
        let depth; // 0.4 to 1.5 parallax multiplier

        if (sizeRand < 0.10) {
          radius = 4.2 + Math.random() * 1.6; // Large focal nodes (4.2 - 5.8px)
          depth = 1.35;
        } else if (sizeRand < 0.40) {
          radius = 2.4 + Math.random() * 1.2; // Medium nodes (2.4 - 3.6px)
          depth = 1.0;
        } else if (sizeRand < 0.85) {
          radius = 1.4 + Math.random() * 0.8; // Small nodes (1.4 - 2.2px)
          depth = 0.7;
        } else {
          radius = 0.8 + Math.random() * 0.5; // Tiny nodes (0.8 - 1.3px)
          depth = 0.45;
        }

        particles.push({
          x: Math.random() * width,
          baseY: Math.random() * height,
          y: 0, // Computed with scroll parallax
          vx: (Math.random() - 0.5) * 0.35, // Ambient horizontal drift
          vy: (Math.random() - 0.5) * 0.35, // Ambient vertical drift
          radius,
          depth,
          alpha: 0.65 + Math.random() * 0.3,
          color: sizeRand < 0.15 ? '#0b1329' : sizeRand < 0.5 ? '#1e293b' : '#334155'
        });
      }
    };

    const handleResize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      createParticles();
    };

    // Mouse interaction tracking
    let mouse = { x: -9999, y: -9999, active: false };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY || window.pageYOffset || 0;
      const delta = targetScrollY - lastScrollY;
      lastScrollY = targetScrollY;
      // Scroll impulse velocity
      scrollVelocity = Math.max(-25, Math.min(25, delta * 0.4));
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    handleResize();

    // Render loop
    const render = () => {
      // Smoothly interpolate scroll
      scrollY += (targetScrollY - scrollY) * 0.18;
      // Decay velocity impulse
      scrollVelocity *= 0.90;

      ctx.clearRect(0, 0, width, height);

      // 1. Update positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Ambient drift
        p.x += p.vx;
        p.baseY += p.vy + scrollVelocity * 0.05 * p.depth;

        // Wrap around horizontally
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Wrap around vertically in base space
        if (p.baseY < 0) p.baseY += height;
        if (p.baseY > height) p.baseY -= height;

        // Compute current onscreen Y with multi-depth parallax scroll shift
        // Parallax translation: each depth layer moves vertically relative to scroll
        const parallaxShift = (scrollY * p.depth * 0.28) % height;
        let currentY = (p.baseY - parallaxShift);
        if (currentY < 0) currentY += height;
        if (currentY > height) currentY -= height;

        p.y = currentY;

        // Subtle gentle mouse repulsion
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDistSq = mdx * mdx + mdy * mdy;
          const mouseRadius = 110;
          if (mDistSq < mouseRadius * mouseRadius && mDistSq > 0) {
            const mDist = Math.sqrt(mDistSq);
            const force = (1 - mDist / mouseRadius) * 2.2;
            p.x += (mdx / mDist) * force;
            p.baseY += (mdy / mDist) * force;
          }
        }
      }

      // 2. Draw connecting lines
      const maxDistSq = MAX_DISTANCE * MAX_DISTANCE;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        let connections = 0;

        for (let j = i + 1; j < particles.length; j++) {
          if (connections >= MAX_CONNECTIONS_PER_NODE) break;

          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            // Alpha falls off with distance: stronger when close, faint when far
            const lineAlpha = (1 - dist / MAX_DISTANCE) * 0.38;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(15, 23, 42, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();

            connections++;
          }
        }
      }

      // 3. Draw nodes (dots)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="nis-network-bg-container" aria-hidden="true">
      <canvas ref={canvasRef} className="nis-network-bg-canvas" />
    </div>
  );
}
