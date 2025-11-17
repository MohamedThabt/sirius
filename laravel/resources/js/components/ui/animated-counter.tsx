import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function AnimatedCounter({ 
  from, 
  to, 
  duration = 2000, 
  className,
  suffix = ""
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(from);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const difference = to - from;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(from + difference * easeOutQuart);
      
      setCount(currentCount);

      if (progress >= 1) {
        clearInterval(timer);
        setCount(to);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [from, to, duration, isVisible]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`counter-${from}-${to}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [from, to]);

  return (
    <span 
      id={`counter-${from}-${to}`}
      className={cn("animate-count-up", className)}
    >
      {count.toLocaleString()}{suffix}
    </span>
  );
}