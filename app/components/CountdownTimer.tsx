'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ expiresAt }: { expiresAt: number }) {
  const [timeLeft, setTimeLeft] = useState(expiresAt - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(expiresAt - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (timeLeft <= 0) return <span>Expired</span>;

  const seconds = Math.floor((timeLeft / 1000) % 60);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <span>
      {days}d {hours}h {minutes}m {seconds}s
    </span>
  );
}
