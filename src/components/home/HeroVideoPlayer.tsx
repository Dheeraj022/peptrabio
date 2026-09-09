'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export function HeroVideoPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Send postMessage commands to ensure iframe plays and mutes on load and after refresh
    const sendPlayerCommand = (func: string, args: any = '') => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func, args }),
            '*'
          );
        } catch {
          // ignore cross-origin error
        }
      }
    };

    const playAndMute = () => {
      sendPlayerCommand('mute');
      sendPlayerCommand('playVideo');
    };

    // Trigger on load with interval retries to overcome browser autoplay delay
    const intervals = [100, 300, 600, 1000, 1500, 2500].map((delay) =>
      setTimeout(playAndMute, delay)
    );

    // Keep playing if user switches tabs or window regains focus
    window.addEventListener('focus', playAndMute);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        playAndMute();
      }
    });

    return () => {
      intervals.forEach(clearTimeout);
      window.removeEventListener('focus', playAndMute);
    };
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-h-[300px] rounded-2xl overflow-hidden bg-black border-2 border-brand-border mb-3 shadow-inner select-none pointer-events-none">
      
      {/* Autoplay Video Stream */}
      <iframe
        ref={iframeRef}
        src="https://www.youtube-nocookie.com/embed/A2MrOGbsc1o?autoplay=1&mute=1&loop=1&playlist=A2MrOGbsc1o&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1&fs=0"
        title="Peptra Bio Synthetic Peptide rDNA Technology Demonstration"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440%] h-[280%] min-w-[750px] min-h-[480px] max-w-none border-0 pointer-events-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        tabIndex={-1}
      />

      {/* Atmospheric dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

      {/* Clean Scientific Label Overlay */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white pointer-events-none text-center">
        <div className="font-orbitron font-bold text-[11px] sm:text-xs tracking-wider flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-300" />
          SYNTHETIC rDNA PROCESS
        </div>
        <div className="text-[9px] text-gray-200 font-sans mt-0.5">
          Korean GMP • Mass Spectrometry Verified
        </div>
      </div>
    </div>
  );
}
