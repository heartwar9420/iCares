import { useState } from 'react';

export default function useVideoController() {
  const size = 36;
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  return { size, isMuted, setIsMuted, isPaused, setIsPaused };
}
