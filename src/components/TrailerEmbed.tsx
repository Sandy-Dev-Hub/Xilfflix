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

  // Send mute/unmute and 4K quality commands to YouTube iframe via postMessage
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      const func = muted ? 'mute' : 'unMute';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args: '' }),
        '*'
      );
      // Request 4K resolution (hd2160)
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: ['hd2160'] }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackQualityRange', args: ['hd2160', 'highres'] }),
        '*'
      );
    } catch {
      // Ignore cross-origin postMessage errors
    }
  }, [muted, isLoaded]);

  // Tab visibility listener: pause when hidden, play when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!iframeRef.current?.contentWindow) return;
      try {
        const func = document.visibilityState === 'hidden' ? 'pauseVideo' : 'playVideo';
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args: '' }),
          '*'
        );
      } catch {
        // Ignore
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoaded]);

  if (prefersReducedMotion || !videoKey) {
    return null;
  }

  // Parameters:
  // autoplay=1: start automatically
  // mute=0 / 1: audio setting
  // controls=0: hide player controls & pause/forward overlays
  // loop=1 & playlist={key}: seamless looping
  // enablejsapi=1: allow postMessage commands for mute/unmute, quality and visibility
  // modestbranding=1, rel=0, playsinline=1, iv_load_policy=3, disablekb=1, vq=hd2160, highres=1, hd=1
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&loop=1&playlist=${videoKey}&enablejsapi=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&showinfo=0&widget_referrer=${encodeURIComponent(origin)}&origin=${encodeURIComponent(origin)}`;

  const sizeClass =
    fitMode === 'hero'
      ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160vw] h-[90vw] min-w-[160%] min-h-[160%] scale-105'
      : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] min-w-[140%] min-h-[140%]';

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      style={{ filter: 'brightness(1.15) contrast(1.05)' }}
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
          try {
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: ['hd2160'] }),
              '*'
            );
            iframeRef.current?.contentWindow?.postMessage(
              JSON.stringify({ event: 'command', func: 'setPlaybackQualityRange', args: ['hd2160', 'highres'] }),
              '*'
            );
            if (!muted) {
              iframeRef.current?.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func: 'unMute', args: '' }),
                '*'
              );
            }
          } catch {}
          onLoaded?.();
        }}
      />
      {/* Interaction shield to prevent any touch/click event reaching the iframe */}
      <div className="absolute inset-0 z-10 pointer-events-none" />
    </div>
  );
}
