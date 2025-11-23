import { useEffect, useRef, useState, useCallback } from "react";

// Inline SVG components
const MicLightIcon = () => (
  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.33398 5.33366C6.33398 4.13704 7.30405 3.16699 8.50065 3.16699C9.69725 3.16699 10.6673 4.13704 10.6673 5.33366V7.33366C10.6673 8.53026 9.69725 9.50033 8.50065 9.50033C7.30405 9.50033 6.33398 8.53026 6.33398 7.33366V5.33366Z" stroke="#ffffff" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.33398 8.5C4.33398 8.5 4.50065 11.5 8.50065 11.5C12.5007 11.5 12.6673 8.5 12.6673 8.5" stroke="#ffffff" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 11.833V12.833" stroke="#ffffff" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75" stroke="#EEEEEE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.25 6.75L6.75 17.25" stroke="#EEEEEE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.75 6.75L17.25 17.25" stroke="#EEEEEE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4.75V6.25" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.1266 6.87347L16.0659 7.93413" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.25 12L17.75 12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.1266 17.1265L16.0659 16.0659" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 17.75V19.25" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.9342 16.0659L6.87354 17.1265" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.25 12L4.75 12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.9342 7.93413L6.87354 6.87347" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * DictationWaveform - Complete dictation interface with waveform
 * - Input field with mic button
 * - Live mic input → loudness bars when recording
 * - Bars scroll left continuously
 * - No libraries required
 */
export default function DictationWaveform() {
  // UI state
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [typedText, setTypedText] = useState('');
  
  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordingPromiseRef = useRef<Promise<Blob> | null>(null);

  // Waveform props - get computed CSS values
  const width = 330;
  const height = 44;
  const barWidth = 1.5;
  const gap = 2;
  const speedPxPerSec = 30;
  const smoothing = 0.1;
  const maxGain = 1;
  
  // Get computed CSS colors
  const getComputedColor = (cssVar: string) => {
    if (typeof window === 'undefined') return '#000000';
    const computedStyle = getComputedStyle(document.documentElement);
    return computedStyle.getPropertyValue(cssVar).trim() || '#000000';
  };
  
  const bg = getComputedColor('--secondary-background');
  const barColor = getComputedColor('--foreground');
  const inactiveBarColor = getComputedColor('--muted-foreground');
  // Waveform refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Rolling buffer of bar heights in [0..1]
  const barsRef = useRef<Float32Array | null>(null);
  // Track which bars are initial (not from live audio)
  const initialBarsRef = useRef<boolean[] | null>(null);

  // Sub-pixel scroll offset (in canvas pixels)
  const offsetRef = useRef(0);

  // For EMA smoothing across frames
  const smoothedLevelRef = useRef(0);

  // Device pixel ratio for crispness
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  const [, setReady] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [currentWidth, setCurrentWidth] = useState(width || 0);

  // Cleanup on unmount
  useEffect(() => {
    const audioContext = audioContextRef.current;
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      // Create a promise that resolves when recording stops
      recordingPromiseRef.current = new Promise<Blob>((resolve) => {
        mediaRecorderRef.current!.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current!.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          stream.getTracks().forEach(track => track.stop());
          console.log('Recording stopped, blob created:', audioBlob.size, 'bytes');
          resolve(audioBlob);
        };
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsStartingRecording(false);

    } catch (error) {
      console.error('Error starting recording:', error);
      setIsStartingRecording(false);
    }
  };

  const handleSaveRecording = async () => {
    // Stop recording first
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    setIsTranscribing(true); // Start spinner
    
    try {
      // Wait for the recording promise to resolve
      if (recordingPromiseRef.current) {
        const blob = await recordingPromiseRef.current;
        console.log('Got audio blob:', blob.size, 'bytes');
        
        // Simulate processing time like in your original code
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, just set a mock transcription
        setTranscription('Demo transcription - recording saved!');
        console.log('Transcription:', 'Demo transcription');
      }
    } catch (error) {
      console.error('Failed to process audio:', error);
      setTranscription('Processing failed, please try again');
    } finally {
      setIsTranscribing(false); // Stop spinner
    }
    
    // Reset refs
    mediaRecorderRef.current = null;
    recordingPromiseRef.current = null;
    
    // Reset state
    setIsRecording(false);
    audioChunksRef.current = [];
  };

  const handleCancelRecording = () => {
    // Stop recording first
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    // Reset refs
    mediaRecorderRef.current = null;
    recordingPromiseRef.current = null;
    
    // Reset state
    setIsRecording(false);
    setTranscription('');
    setIsTranscribing(false);
    setIsStartingRecording(false);
    setTypedText('');
    audioChunksRef.current = [];
  };

  const handleSubmitText = async () => {
    if (!typedText.trim()) return;
    
    console.log('Setting isProcessingText to true');
    setIsProcessingText(true);
    setTranscription(typedText.trim()); // Show text immediately
    
    // Simulate processing time
    setTimeout(() => {
      console.log('Setting isProcessingText to false');
      setIsProcessingText(false);
    }, 2000); // 2 seconds processing time
  };

  const totalBarPitch = barWidth + gap; // one bar + one gap
  const effectiveWidth = currentWidth || width; // use currentWidth if available, otherwise use width prop
  const barsCount = effectiveWidth ? Math.ceil(effectiveWidth / totalBarPitch) + 2 : 0; // +2 to cover scroll overlap

  // Initialize bars buffer
  useEffect(() => {
    barsRef.current = new Float32Array(barsCount).fill(0); // Start with 0 for same thickness
    initialBarsRef.current = new Array(barsCount).fill(true); // Mark all as initial bars
  }, [barsCount]);

  // Set initial canvas size immediately to prevent flash
  useEffect(() => {
    if (canvasRef.current && width) {
      const canvas = canvasRef.current;
      const cw = Math.floor(width * dpr);
      const ch = Math.floor(height * dpr);
      canvas.width = cw;
      canvas.height = ch;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
  }, [width, height, dpr]);

  // Handle dynamic width changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        if (newWidth > 0) {
          setCurrentWidth(newWidth);
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      updateWidth();
    });

    // Set up ResizeObserver for dynamic width changes
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);

  // Helper functions
  function readLevel(): number {
    const analyser = analyserRef.current;
    if (!analyser) return 0;
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);

    // RMS loudness
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length); // 0..~0.5 typical speech
    // Map RMS → perceptual (soft companding)
    let level = Math.tanh(rms * 6) * maxGain; // squish & boost
    if (level > 1) level = 1;

    // Exponential moving average for stability
    smoothedLevelRef.current =
      smoothing * smoothedLevelRef.current + (1 - smoothing) * level;

    return smoothedLevelRef.current;
  }

  function pushBar(v: number) {
    const bars = barsRef.current!;
    const initialBars = initialBarsRef.current!;
    // shift left by 1: cheaper to copy than re-alloc
    bars.copyWithin(0, 1);
    initialBars.copyWithin(0, 1);
    bars[bars.length - 1] = v;
    initialBars[initialBars.length - 1] = false; // New bar is from live audio
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const bars = barsRef.current;
    const initialBars = initialBarsRef.current;
    if (!canvas || !bars || !initialBars || !effectiveWidth) return;

    // Setup backing store for HiDPI
    const cw = Math.floor(effectiveWidth * dpr);
    const ch = Math.floor(height * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
      canvas.style.width = `${effectiveWidth}px`;
      canvas.style.height = `${height}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Advance scroll offset
    const dt = 1 / 60; // assume ~60fps; good enough for smoothness
    offsetRef.current += (speedPxPerSec * dpr) * dt;

    // When offset passes one bar pitch, commit a new bar and wrap offset
    const pitchPx = totalBarPitch * dpr;
    while (offsetRef.current >= pitchPx) {
      offsetRef.current -= pitchPx;
      pushBar(readLevel());
    }

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // Draw bars from right → left with current sub-pixel offset
    const centerY = ch / 2;
    const barW = barWidth * dpr;
    const gapW = gap * dpr;

    // Rightmost bar's right edge pinned to canvas right
    // We offset the whole sequence left by offsetRef for smooth scroll.
    let xRight = cw - offsetRef.current;

    for (let i = bars.length - 1; i >= 0; i--) {
      const hNorm = bars[i];                 // 0..1
      const barH = Math.max(2 * dpr, hNorm * ch * 0.9); // min 2px; 90% of height
      const x = xRight - barW;
      const y = centerY - barH / 2;

      // Use different colors based on whether this is an initial bar or live audio
      ctx.fillStyle = initialBars[i] ? inactiveBarColor : barColor;

      // Rounded rect bars (crisper than strokes at HiDPI)
      roundRect(ctx, x, y, barW, barH, Math.min(barW, 6 * dpr));
      xRight -= (barW + gapW);
      if (xRight < -barW) break; // done if off screen
    }
  }, [effectiveWidth, dpr, height, speedPxPerSec, totalBarPitch, bg, barWidth, gap, inactiveBarColor, barColor]);

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
    ctx.fill();
  }

  // Start waveform audio + render loop only when recording
  useEffect(() => {
    if (!isRecording) return;

    let stopped = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024; // small for low latency level reads
        analyser.smoothingTimeConstant = 0.0; // we do our own smoothing
        analyserRef.current = analyser;

        source.connect(analyser);

        setReady(true);
        renderLoop();
      } catch (e: unknown) {
        setError((e as Error)?.message || "Microphone permission denied");
      }
    };

    start();

    const renderLoop = () => {
      if (stopped) return;
      rafRef.current = requestAnimationFrame(renderLoop);
      if (!isTranscribing) {
        draw();
      }
    };

    return () => {
      stopped = true;
      cancelAnimationFrame(rafRef.current!);
      try { sourceRef.current?.disconnect(); } catch { /* ignore */ }
      try { analyserRef.current?.disconnect(); } catch { /* ignore */ }
      audioCtxRef.current?.close().catch(() => {});
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [isRecording, isTranscribing, draw]);

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      {/* Recording Interface */}
      <div className="flex justify-center">
        {!isRecording && !transcription && !isTranscribing && !isStartingRecording ? (
          <div className="w-full max-w-md">
            <div className="flex items-center gap-0 rounded-full px-1 h-12 border border-border" style={{ backgroundColor: bg }}>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitText();
                  }
                }}
                placeholder="Type or record..."
                className="flex-1 h-10 px-4 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
              />
              <button
                onClick={startRecording}
                disabled={isProcessingText}
                className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Record audio"
              >
                <MicLightIcon />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            {/* Waveform/Transcription with buttons to the right */}
            <div className="flex items-center gap-0 rounded-full px-1 h-12 border border-border" style={{ backgroundColor: bg }}>
              <div className="flex-1">
                {transcription ? (
                  <div className="h-12 flex items-center px-4">
                    <p className="text-md text-foreground text-left">
                      {transcription}
                    </p>
                  </div>
                ) : (
                  <div ref={containerRef} style={{ display: "grid", gap: 8, width: "100%", padding: "2px 0" }}>
                    <canvas ref={canvasRef} style={{ borderRadius: "20px 0px 0px 20px", height: "44px" }} />
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-0">
                {!transcription && (
                  <button
                    onClick={handleCancelRecording}
                    className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted rounded-full transition-colors"
                    title="Cancel recording"
                  >
                    <CloseIcon />
                  </button>
                )}
                <button
                  onClick={transcription ? () => {
                    setTranscription('');
                    setTypedText('');
                    setIsStartingRecording(true);
                    startRecording();
                  } : handleSaveRecording}
                  disabled={isTranscribing}
                  className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isTranscribing ? "Processing..." : transcription ? "Record again" : "Save recording"}
                >
                  {isTranscribing ? (
                    <div className="animate-spin">
                      <SpinnerIcon />
                    </div>
                  ) : transcription ? (
                    <MicLightIcon />
                  ) : (
                    <CheckIcon />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Result text - below container like in your original */}
      <div className="mt-4 text-center h-5">
        {transcription && (
          <p className="text-xs text-muted-foreground">
            Processing complete - transcription ready!
          </p>
        )}
      </div>
    </div>
  );
}

