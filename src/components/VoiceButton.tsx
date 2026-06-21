'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

// Extend Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceButton({
  onTranscript,
  disabled = false,
  className = ''
}: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    // Initialize SpeechRecognition
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsRecording(false);

      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please enable microphone permissions.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [onTranscript]);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (disabled || !isSupported) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        setError('Failed to start speech recognition. Please try again.');
      }
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.414 12l1.414-1.414-1.414-1.414L12 10.586l-1.414-1.414L9.172 10.6L7.757 9.172 6.343 10.586 7.757 12l-1.414 1.414L7.757 14.828 9.172 13.414 10.586 14.828 12 13.414 13.414 14.828z"/>
          </svg>
        </div>
        <div className="text-sm text-gray-500 max-w-32">
          Voice not supported in this browser
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Recording timer and transcript */}
      {isRecording && (
        <div className="flex items-center gap-2 text-red-500 animate-fade-in">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          {transcript && (
            <span className="text-sm text-gray-600 italic max-w-32 truncate">
              "{transcript}"
            </span>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-xs text-red-600 max-w-48 animate-fade-in">
          {error}
        </div>
      )}

      {/* Main voice button */}
      <button
        onClick={handleClick}
        disabled={disabled || !isSupported}
        className={`
          relative w-14 h-14 rounded-full flex items-center justify-center
          transition-all duration-200 transform active:scale-95
          ${disabled || !isSupported
            ? 'bg-gray-300 cursor-not-allowed'
            : isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110'
            : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-md'
          }
        `}
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        title={isRecording ? 'Click to stop recording' : 'Click to start voice input'}
      >
        {/* Microphone icon */}
        {!isRecording && (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
            <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 11-9 0v-.357z" />
          </svg>
        )}

        {/* Stop icon when recording */}
        {isRecording && (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <rect x="6" y="4" width="8" height="12" rx="2" />
          </svg>
        )}

        {/* Recording pulse animation */}
        {isRecording && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
            <div className="absolute inset-2 rounded-full bg-red-300 animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </button>

      {/* Instructions text */}
      {!isRecording && !error && (
        <div className="text-sm text-gray-500 max-w-32">
          Tap to speak your message
        </div>
      )}

      {isRecording && !error && (
        <div className="text-sm text-gray-600 max-w-32 animate-fade-in">
          Listening... Tap to stop
        </div>
      )}
    </div>
  );
}