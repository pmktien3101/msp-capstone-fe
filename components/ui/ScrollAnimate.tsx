"use client";
import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollAnimateProps {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale';
  delay?: number;
  className?: string;
}

export const ScrollAnimate: React.FC<ScrollAnimateProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const delayClass = delay > 0 ? `delay-${delay}` : '';

  return (
    <div
      ref={ref}
      className={`scroll-animate ${animation} ${delayClass} ${isVisible ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

