'use client';

import { useEffect, useState, useRef } from 'react';
import { PipPenguinProps, PipMood } from '@/types';

// Tracks the user's OS-level "reduce motion" preference (WCAG 2.1 SC 2.3.3) and
// updates live if they change it. When true, Pip holds still apart from minimal,
// non-vestibular feedback.
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export default function PipPenguin({
  mood = 'calm',
  speaking = false,
  volume = 0,
  size = 'md',
  className = ''
}: PipPenguinProps) {
  const reducedMotion = useReducedMotion();
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthHeight, setMouthHeight] = useState(4);
  const [headTilt, setHeadTilt] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [earWiggle, setEarWiggle] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [eyeExpression, setEyeExpression] = useState<'normal' | 'wide' | 'sleepy' | 'wink'>('normal');
  const [bodyBounce, setBodyBounce] = useState(0);
  const [wingFlap, setWingFlap] = useState(false);

  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headTiltTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const expressionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-blink every 3-4 seconds with natural variation. Blinking is a small,
  // non-vestibular cue, but we still pause it under reduced motion for stillness.
  useEffect(() => {
    if (reducedMotion) return;
    const scheduleNextBlink = () => {
      const delay = Math.random() * 1500 + 2500; // 2.5-4 seconds
      blinkTimeoutRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink(); // Schedule next blink
        }, 120 + Math.random() * 80); // Varying blink duration (120-200ms)
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, [reducedMotion]);

  // Breathing is now a pure CSS animation (`.pip-breathe`) on the compositor —
  // see globals.css. This replaced a requestAnimationFrame loop that called
  // setState ~60×/sec and re-rendered this whole SVG; with several Pips on a
  // page that was hundreds of React renders per second. CSS keeps it at 60fps.

  // Enhanced head movements and personality
  useEffect(() => {
    if (reducedMotion) return;
    const scheduleHeadTilt = () => {
      const delay = Math.random() * 6000 + 3000; // 3-9 seconds (more frequent)
      headTiltTimeoutRef.current = setTimeout(() => {
        const tilt = (Math.random() - 0.5) * 12; // -6 to +6 degrees (more pronounced)
        setHeadTilt(tilt);

        // Return to neutral after 1-2 seconds
        setTimeout(() => {
          setHeadTilt(0);
        }, 1000 + Math.random() * 1000);

        scheduleHeadTilt();
      }, delay);
    };

    scheduleHeadTilt();

    return () => {
      if (headTiltTimeoutRef.current) {
        clearTimeout(headTiltTimeoutRef.current);
      }
    };
  }, [reducedMotion]);

  // Enhanced personality animations based on mood
  useEffect(() => {
    if (reducedMotion) return;
    const schedulePersonalityAnimation = () => {
      const delay = Math.random() * 5000 + 2000; // 2-7 seconds

      if (mood === 'happy' || mood === 'playful') {
        // Happy and playful penguins are more active
        setEarWiggle(true);
        setWingFlap(true);
        setTimeout(() => {
          setEarWiggle(false);
          setWingFlap(false);
        }, 800);

        // Extra wiggle for playful mood
        if (mood === 'playful') {
          setIsWiggling(true);
          setTimeout(() => setIsWiggling(false), 1000);
        }

        // Occasional body bounce for happy/playful mood
        if (Math.random() > 0.7) {
          setBodyBounce(1);
          setTimeout(() => setBodyBounce(0), 600);
        }
      } else if (mood === 'calm') {
        // Calm penguins have subtle movements
        setEarWiggle(true);
        setTimeout(() => setEarWiggle(false), 400);
      }

      setTimeout(schedulePersonalityAnimation, delay);
    };

    schedulePersonalityAnimation();
  }, [mood, reducedMotion]);

  // Eye expressions for more personality
  useEffect(() => {
    if (reducedMotion) return;
    const scheduleEyeExpression = () => {
      const delay = Math.random() * 8000 + 4000; // 4-12 seconds

      expressionTimeoutRef.current = setTimeout(() => {
        const expressions: Array<typeof eyeExpression> = ['wide', 'sleepy', 'wink'];
        const newExpression = expressions[Math.floor(Math.random() * expressions.length)];

        setEyeExpression(newExpression);
        setTimeout(() => {
          setEyeExpression('normal');
        }, 1500);

        scheduleEyeExpression();
      }, delay);
    };

    scheduleEyeExpression();

    return () => {
      if (expressionTimeoutRef.current) {
        clearTimeout(expressionTimeoutRef.current);
      }
    };
  }, [reducedMotion]);

  // Body bounce animation for excitement
  useEffect(() => {
    if (reducedMotion) return;
    if (mood === 'playful' || mood === 'happy') {
      const scheduleBounce = () => {
        const delay = Math.random() * 10000 + 5000; // 5-15 seconds
        bounceTimeoutRef.current = setTimeout(() => {
          setBodyBounce(1);
          setTimeout(() => setBodyBounce(0), 800);
          scheduleBounce();
        }, delay);
      };

      scheduleBounce();

      return () => {
        if (bounceTimeoutRef.current) {
          clearTimeout(bounceTimeoutRef.current);
        }
      };
    }
  }, [mood, reducedMotion]);

  // Update mouth size based on volume when speaking
  useEffect(() => {
    if (speaking && volume > 0) {
      // Map volume (0-1) to mouth height (4-12)
      const mappedHeight = 4 + (volume * 8);
      setMouthHeight(mappedHeight);
    } else {
      setMouthHeight(4);
    }
  }, [speaking, volume]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const getMoodStyles = (currentMood: PipMood) => {
    switch (currentMood) {
      case 'happy':
        return {
          glowColor: 'var(--mood-happy)',
          eyeColor: '#22C55E',
          eyeTransform: '',
          eyebrowTransform: '',
          mouthPath: 'M 88 90 Q 100 102 112 90', // Big smile
          glowIntensity: 0.8
        };
      case 'sad':
        return {
          glowColor: 'var(--mood-sad)',
          eyeColor: '#3B82F6',
          eyeTransform: 'translateY(2px) scaleY(0.8)', // Droopy eyes
          eyebrowTransform: '',
          mouthPath: 'M 88 95 Q 100 87 112 95', // Frown
          glowIntensity: 0.4
        };
      case 'playful':
        return {
          glowColor: 'var(--mood-playful)',
          eyeColor: '#F59E0B',
          eyeTransform: 'scale(1.2)', // Wide eyes
          eyebrowTransform: '',
          mouthPath: 'M 85 88 Q 100 105 115 88', // Extra big smile
          glowIntensity: 1.0
        };
      case 'concerned':
        return {
          glowColor: 'var(--mood-concerned)',
          eyeColor: '#8B5CF6',
          eyeTransform: '',
          eyebrowTransform: 'translateY(-2px) rotate(-3deg)', // Furrowed brow
          mouthPath: 'M 92 93 Q 100 89 108 93', // Small concerned frown
          glowIntensity: 0.6
        };
      default: // calm
        return {
          glowColor: 'var(--mood-calm)',
          eyeColor: '#A78BFA',
          eyeTransform: '',
          eyebrowTransform: '',
          mouthPath: 'M 94 92 Q 100 94 106 92', // Neutral slight smile
          glowIntensity: 0.5
        };
    }
  };

  const moodStyles = getMoodStyles(mood);
  const baseClasses = `${sizeClasses[size]} ${className}`;

  // Idle motion. Breathing runs as a CSS animation (.pip-breathe). Calm Pip
  // breathes slower (~6s ≈ 10 breaths/min, toward "coherent breathing") while
  // livelier moods sit near 4.5s. Reduced motion disables all idle movement.
  const bounceTransform = bodyBounce > 0 ? `translateY(-${bodyBounce * 10}px)` : 'translateY(0)';
  const wiggleTransform = isWiggling ? 'rotate(3deg)' : 'rotate(0deg)';
  const breatheDuration = mood === 'calm' ? '6s' : '4.5s';
  const idleAnimClass = mood === 'playful' ? 'animate-float' : 'animate-bob';

  return (
    <div
      className={`${baseClasses} select-none transition-transform duration-300 ${
        isHovered ? 'scale-110' : 'scale-100'
      } ${isHovered && !reducedMotion ? 'animate-wiggle' : ''} ${reducedMotion ? '' : idleAnimClass}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (reducedMotion) return;
        setIsWiggling(true);
        setTimeout(() => setIsWiggling(false), 500);
      }}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `${bounceTransform} ${wiggleTransform}`,
        animation: reducedMotion ? 'none' : `${mood === 'playful' ? 'float' : 'bob'} 3s var(--ease-smooth) infinite`,
      }}
    >
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full drop-shadow-lg transition-all duration-300"
        style={{
          filter: `drop-shadow(0 ${isHovered ? 12 : 6}px ${isHovered ? 30 : 20}px rgba(0, 0, 0, ${isHovered ? 0.3 : 0.15}))`,
          transform: `rotate(${headTilt}deg)`
        }}
      >
        {/* Breathing wrapper — CSS-driven scale around the body center */}
        <g
          className={reducedMotion ? '' : 'pip-breathe'}
          style={{ ['--pip-breathe-duration' as string]: breatheDuration } as React.CSSProperties}
        >
        {/* Mood glow effect - behind everything */}
        <circle
          cx="100"
          cy="120"
          r="100"
          fill="none"
          stroke={moodStyles.glowColor}
          strokeWidth="3"
          opacity={moodStyles.glowIntensity}
          className="animate-glow-pulse transition-all duration-500"
        />

        {/* Penguin body */}
        <ellipse
          cx="100"
          cy="140"
          rx="60"
          ry="80"
          fill="#2D3748"
          className="transition-all duration-300"
        />

        {/* Penguin belly */}
        <ellipse
          cx="100"
          cy="145"
          rx="35"
          ry="55"
          fill="white"
          className="transition-all duration-300"
        />

        {/* Enhanced wings with dynamic movement */}
        <ellipse
          cx="55"
          cy="130"
          rx="15"
          ry="35"
          fill="#1A202C"
          className={`transition-all duration-300 ${wingFlap ? 'animate-wiggle' : ''}`}
          style={{
            transform: `rotate(${-20 + (earWiggle ? -8 : 0) + (isHovered ? -5 : 0) + (wingFlap ? -10 : 0)}deg) scale(${wingFlap ? 1.1 : 1})`,
            transformOrigin: '55px 120px'
          }}
        />
        <ellipse
          cx="145"
          cy="130"
          rx="15"
          ry="35"
          fill="#1A202C"
          className={`transition-all duration-300 ${wingFlap ? 'animate-wiggle' : ''}`}
          style={{
            transform: `rotate(${20 + (earWiggle ? 8 : 0) + (isHovered ? 5 : 0) + (wingFlap ? 10 : 0)}deg) scale(${wingFlap ? 1.1 : 1})`,
            transformOrigin: '145px 120px'
          }}
        />

        {/* Penguin head */}
        <circle
          cx="100"
          cy="70"
          r="45"
          fill="#2D3748"
          className="transition-all duration-300"
        />

        {/* Head white patch */}
        <ellipse
          cx="100"
          cy="75"
          rx="25"
          ry="30"
          fill="white"
          className="transition-all duration-300"
        />

        {/* Eyebrows (only visible for concerned mood) */}
        {mood === 'concerned' && (
          <g className="transition-all duration-300">
            <path
              d="M 80 55 Q 88 52 96 55"
              stroke="#2D3748"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              style={{ transform: moodStyles.eyebrowTransform }}
              className="transition-transform duration-300"
            />
            <path
              d="M 104 55 Q 112 52 120 55"
              stroke="#2D3748"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              style={{ transform: `${moodStyles.eyebrowTransform} scaleX(-1) translateX(-224px)` }}
              className="transition-transform duration-300"
            />
          </g>
        )}

        {/* Enhanced eyes with dynamic expressions */}
        <g className={isBlinking ? 'opacity-0' : 'opacity-100'} style={{ transition: 'opacity 0.15s ease-out' }}>
          {/* Left Eye */}
          <g
            style={{
              transform: `${moodStyles.eyeTransform} ${
                isHovered ? 'scale(1.15)' :
                eyeExpression === 'wide' ? 'scale(1.3)' :
                eyeExpression === 'sleepy' ? 'scale(0.8) translateY(2px)' : 'scale(1)'
              }`,
              transformOrigin: '88px 65px'
            }}
            className="transition-transform duration-500"
          >
            <circle cx="88" cy="65" r="8" fill="white" />
            <circle
              cx="88"
              cy={eyeExpression === 'sleepy' ? 67 : 65}
              r={eyeExpression === 'wide' ? 5 : eyeExpression === 'sleepy' ? 3 : 4}
              fill={moodStyles.eyeColor}
              className="transition-all duration-500"
            />
            {/* Dynamic highlight */}
            <circle
              cx="90"
              cy={eyeExpression === 'sleepy' ? 65 : 63}
              r="1.5"
              fill="white"
              opacity={isHovered ? 1 : 0.9}
              className="transition-all duration-300"
            />
            <circle cx="89.5" cy="63.5" r="0.5" fill="white" opacity="0.7" />
          </g>

          {/* Right Eye (with wink capability) */}
          <g
            style={{
              transform: `${moodStyles.eyeTransform} ${
                isHovered ? 'scale(1.15)' :
                eyeExpression === 'wide' ? 'scale(1.3)' :
                eyeExpression === 'sleepy' ? 'scale(0.8) translateY(2px)' :
                eyeExpression === 'wink' ? 'scaleY(0.2)' : 'scale(1)'
              }`,
              transformOrigin: '112px 65px'
            }}
            className="transition-transform duration-500"
          >
            <circle cx="112" cy="65" r="8" fill="white" />
            {eyeExpression !== 'wink' && (
              <circle
                cx="112"
                cy={eyeExpression === 'sleepy' ? 67 : 65}
                r={eyeExpression === 'wide' ? 5 : eyeExpression === 'sleepy' ? 3 : 4}
                fill={moodStyles.eyeColor}
                className="transition-all duration-500"
              />
            )}
            {/* Dynamic highlight */}
            {eyeExpression !== 'wink' && (
              <>
                <circle
                  cx="114"
                  cy={eyeExpression === 'sleepy' ? 65 : 63}
                  r="1.5"
                  fill="white"
                  opacity={isHovered ? 1 : 0.9}
                  className="transition-all duration-300"
                />
                <circle cx="113.5" cy="63.5" r="0.5" fill="white" opacity="0.7" />
              </>
            )}
          </g>
        </g>

        {/* Closed eyes when blinking */}
        {isBlinking && (
          <g>
            <path
              d="M 80 65 Q 88 62 96 65"
              stroke="#2D3748"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 104 65 Q 112 62 120 65"
              stroke="#2D3748"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* Beak */}
        <polygon
          points="100,78 108,86 92,86"
          fill="#F59E0B"
          className="transition-all duration-300"
        />

        {/* Mouth - either talking animation or mood-based static */}
        {speaking ? (
          <ellipse
            cx="100"
            cy="91"
            rx="6"
            ry={mouthHeight}
            fill="#2D3748"
            className="transition-all duration-100"
            style={{
              animation: volume > 0.3 ? 'mouth-talk 0.2s ease-in-out infinite' : 'none'
            }}
          />
        ) : (
          <path
            d={moodStyles.mouthPath}
            stroke="#2D3748"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-300"
          />
        )}

        {/* Animated feet */}
        <ellipse
          cx="85"
          cy="220"
          rx="12"
          ry="8"
          fill="#F59E0B"
          className="transition-all duration-300"
          style={{
            transform: `${bodyBounce > 0 ? 'scaleX(1.2)' : 'scaleX(1)'} ${isWiggling ? 'rotate(-2deg)' : 'rotate(0deg)'}`,
            transformOrigin: '85px 220px'
          }}
        />
        <ellipse
          cx="115"
          cy="220"
          rx="12"
          ry="8"
          fill="#F59E0B"
          className="transition-all duration-300"
          style={{
            transform: `${bodyBounce > 0 ? 'scaleX(1.2)' : 'scaleX(1)'} ${isWiggling ? 'rotate(2deg)' : 'rotate(0deg)'}`,
            transformOrigin: '115px 220px'
          }}
        />

        {/* Enhanced special effects based on mood (SMIL — gated on reduced motion) */}
        {mood === 'playful' && !reducedMotion && (
          <g className="animate-pulse-gentle">
            {/* More sparkles around head */}
            <circle cx="60" cy="50" r="2" fill={moodStyles.glowColor} opacity="0.8">
              <animate
                attributeName="opacity"
                values="0.8;0.3;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="140" cy="45" r="1.5" fill={moodStyles.glowColor} opacity="0.6">
              <animate
                attributeName="opacity"
                values="0.6;0.2;0.6"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="70" cy="35" r="1" fill={moodStyles.glowColor} opacity="0.7">
              <animate
                attributeName="opacity"
                values="0.7;0.2;0.7"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="130" cy="60" r="1.2" fill={moodStyles.glowColor} opacity="0.5">
              <animate
                attributeName="opacity"
                values="0.5;0.1;0.5"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {mood === 'happy' && !reducedMotion && (
          <g className="animate-fade-in">
            {/* Floating heart with gentle movement */}
            <path
              d="M 100 25 C 95 20, 85 20, 85 30 C 85 20, 75 20, 70 30 C 70 40, 85 50, 100 60 C 115 50, 130 40, 130 30 C 130 20, 120 20, 115 30 C 115 20, 105 20, 100 25 Z"
              fill="#EF4444"
              opacity="0.7"
              className="animate-pulse-gentle"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 0,-2; 0,0"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
            {/* Additional small hearts */}
            <circle cx="75" cy="20" r="1.5" fill="#EF4444" opacity="0.4">
              <animate
                attributeName="opacity"
                values="0.4;0.8;0.4"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {mood === 'sad' && !reducedMotion && (
          <g>
            {/* Animated tear drops */}
            <ellipse cx="84" cy="75" rx="2" ry="6" fill="#60A5FA" opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 0,8; 0,0"
                dur="3s"
                repeatCount="indefinite"
              />
            </ellipse>
            <ellipse cx="116" cy="77" rx="1.5" ry="4" fill="#60A5FA" opacity="0.4">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 0,6; 0,0"
                dur="2.5s"
                repeatCount="indefinite"
                begin="0.5s"
              />
            </ellipse>
          </g>
        )}

        {/* Enhanced interaction and mood feedback */}
        {isHovered && (
          <>
            <circle
              cx="100"
              cy="120"
              r="95"
              fill="none"
              stroke="#378ADD"
              strokeWidth="3"
              opacity="0.4"
              className="animate-ping"
            />
            <circle
              cx="100"
              cy="120"
              r="85"
              fill="none"
              stroke={moodStyles.glowColor}
              strokeWidth="2"
              opacity="0.6"
              className="animate-pulse"
            />
          </>
        )}

        {/* Excitement heartbeat effect */}
        {(mood === 'playful' || mood === 'happy') && bodyBounce > 0 && (
          <>
            <circle
              cx="100"
              cy="140"
              r="70"
              fill="none"
              stroke={moodStyles.glowColor}
              strokeWidth="4"
              opacity="0.5"
              className="animate-ping"
            />
            <circle
              cx="100"
              cy="140"
              r="50"
              fill="none"
              stroke={moodStyles.glowColor}
              strokeWidth="2"
              opacity="0.7"
              className="animate-pulse"
            />
          </>
        )}

        {/* Breathing aura for calm moods. SMIL pulse (gated on reduced motion);
            previously driven by the per-frame breathPhase React state. */}
        {mood === 'calm' && !isHovered && (
          <circle
            cx="100"
            cy="120"
            r="90"
            fill="none"
            stroke={moodStyles.glowColor}
            strokeWidth="1"
            opacity="0.25"
          >
            {!reducedMotion && (
              <>
                <animate
                  attributeName="r"
                  values="90;100;90"
                  dur="6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.2;0.3;0.2"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
        )}
        </g>
      </svg>
    </div>
  );
}