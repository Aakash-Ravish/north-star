'use client';

import { ChatBubbleProps } from '@/types';
import { formatTime, getMoodEmoji, getPipMoodFromLevel } from '@/utils';
import PipPenguin from './PipPenguin';

export default function ChatBubble({
  message,
  isTyping = false,
  showAvatar = true,
  onRetry,
  onShare
}: ChatBubbleProps) {
  const isUser = message.sender === 'user';
  const isPip = message.sender === 'pip';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse animate-message-in-right' : 'flex-row animate-message-in-left'}`}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {isPip ? (
            <PipPenguin
              size="sm"
              mood={message.mood ? getPipMoodFromLevel(message.mood) : 'calm'}
              className="mt-1"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm mt-1 shadow-lg">
              👤
            </div>
          )}
        </div>
      )}

      {/* Message content */}
      <div className={`flex flex-col max-w-xs sm:max-w-sm md:max-w-md ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl shadow-md relative
            ${isUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
            }
          `}
        >
          {/* Typing indicator */}
          {isTyping ? (
            <div className="flex gap-1 items-center py-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '200ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '400ms' }} />
              <span className="ml-2 text-gray-500 text-sm">Pip is thinking…</span>
            </div>
          ) : (
            <>
              {/* Message content */}
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>

              {/* Mood indicator for user messages */}
              {isUser && message.mood && (
                <div className="flex items-center justify-end mt-2 pt-2 border-t border-blue-400/30">
                  <span className="text-xs text-blue-100 mr-1">Mood:</span>
                  <span className="text-sm">{getMoodEmoji(message.mood)}</span>
                </div>
              )}

              {/* Message type indicator */}
              {message.type === 'voice' && (
                <div className="flex items-center mt-2">
                  <svg className="w-3 h-3 mr-1 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                    <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 11-9 0v-.357z" />
                  </svg>
                  <span className="text-xs opacity-70">Voice message</span>
                </div>
              )}

              {message.type === 'mood-check' && (
                <div className="flex items-center mt-2">
                  <span className="text-xs opacity-70">Mood check completed</span>
                </div>
              )}
            </>
          )}

          {/* Message tail */}
          <div
            className={`
              absolute top-4 w-0 h-0
              ${isUser
                ? 'right-0 translate-x-full border-l-8 border-l-blue-500 border-t-4 border-t-transparent border-b-4 border-b-transparent'
                : 'left-0 -translate-x-full border-r-8 border-r-white border-t-4 border-t-transparent border-b-4 border-b-transparent'
              }
            `}
          />
        </div>

        {/* Message metadata */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>{formatTime(message.timestamp)}</span>

          {/* Share button for Pip messages */}
          {isPip && onShare && !isTyping && (
            <button
              onClick={() => onShare(message)}
              className="text-blue-500 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-full"
              title="Share this moment"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          )}

          {/* Retry button for failed messages */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-500 hover:text-red-600 transition-colors text-xs underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}