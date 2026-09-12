import { useEffect, useRef, useState } from 'react';

interface TrailerEmbedProps {
  videoKey: string;
  muted?: boolean;
  className?: string;
  fitMode?: 'full' | 'hero';
  onLoaded?: () => void;
}

export default function TrailerEmbed({
  videoKey,
  muted = false,
  className = '',
  fitMode = 'full',
  onLoaded,
}: TrailerEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced-motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  const sendCommand = (func: string, args: any = '') => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch {}
  };

  const applyHighQuality = () => {
    // Send highest playback quality commands to YouTube player
    sendCommand('setPlaybackQuality', 'hd1080');
    sendCommand('setPlaybackQuality', 'hd2160');
    sendCommand('setPlaybackQuality', 'highres');
    sendCommand('setPlaybackQualityRange', ['hd1080', 'highres']);
  };

  // Send mute/unmute and high quality commands to YouTube iframe via postMessage
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    sendCommand(muted ? 'mute' : 'unMute');
    applyHighQuality();
  }, [muted, isLoaded]);

  // Tab visibility listener: pause when hidden, play when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!iframeRef.current?.contentWindow) return;
      if (document.visibilityState === 'hidden') {
        sendCommand('pauseVideo');
      } else {
        sendCommand('playVideo');
        applyHighQuality();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoaded]);

  if (prefersReducedMotion || !videoKey) {
    return null;
  }

  // Parameters for high quality, auto-playing trailer embed:
  // - vq=hd1080: request high definition 1080p
  // - enablejsapi=1: allow postMessage commands for high quality and mute controls
  // - autoplay=1, mute=1/0, controls=0, loop=1
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&loop=1&playlist=${videoKey}&enablejsapi=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&showinfo=0&vq=hd1080&widget_referrer=${encodeURIComponent(origin)}&origin=${encodeURIComponent(origin)}`;

  const sizeClass =
    fitMode === 'hero'
      ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160vw] h-[90vw] min-w-[160%] min-h-[160%] scale-105'
      : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] min-w-[140%] min-h-[140%]';

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title="Trailer Preview"
        tabIndex={-1}
        className={`${sizeClass} border-0 object-cover transition-opacity duration-300 pointer-events-none select-none ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        allow="autoplay; encrypted-media"
        onLoad={() => {
          setIsLoaded(true);
          applyHighQuality();
          if (!muted) {
            sendCommand('unMute');
          }
          // Retry high quality commands as YouTube player state stabilizes
          setTimeout(applyHighQuality, 250);
          setTimeout(applyHighQuality, 1000);
          onLoaded?.();
        }}
      />
      {/* Interaction shield to prevent any touch/click event reaching the iframe */}
      <div className="absolute inset-0 z-10 pointer-events-none" />
    </div>
  );
}
