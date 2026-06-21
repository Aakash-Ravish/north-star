'use client';

import { StreakCounterProps } from '@/types';
import { formatDate } from '@/utils';

export default function StreakCounter({
  streak,
  showDetails = true,
  size = 'md'
}: StreakCounterProps) {
  const sizeClasses = {
    sm: {
      container: 'p-3',
      number: 'text-2xl',
      label: 'text-sm',
      details: 'text-xs'
    },
    md: {
      container: 'p-4',
      number: 'text-3xl',
      label: 'text-base',
      details: 'text-sm'
    },
    lg: {
      container: 'p-6',
      number: 'text-4xl',
      label: 'text-lg',
      details: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  const getStreakColor = (current: number) => {
    if (current >= 30) return 'text-purple-600';
    if (current >= 14) return 'text-green-600';
    if (current >= 7) return 'text-blue-600';
    if (current >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStreakIcon = (current: number) => {
    if (current >= 30) return '🏆'; // Trophy for 30+ days
    if (current >= 14) return '⭐'; // Star for 2+ weeks
    if (current >= 7) return '🔥';  // Fire for 1+ week
    if (current >= 3) return '💫'; // Sparkle for 3+ days
    return '🌱'; // Seedling for starting out
  };

  const getStreakMessage = (current: number) => {
    if (current >= 30) return 'Incredible dedication!';
    if (current >= 14) return 'Amazing progress!';
    if (current >= 7) return "You're on fire!";
    if (current >= 3) return 'Great start!';
    if (current === 1) return 'Welcome aboard!';
    return 'Ready to start?';
  };

  const getStreakGradient = (current: number) => {
    if (current >= 30) return 'from-purple-500 to-pink-500';
    if (current >= 14) return 'from-green-500 to-emerald-500';
    if (current >= 7) return 'from-blue-500 to-cyan-500';
    if (current >= 3) return 'from-yellow-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className={`card-elevated ${classes.container} text-center animate-fade-in`}>
      {/* Main streak display */}
      <div className="relative mb-4">
        {/* Background glow for longer streaks */}
        {streak.current >= 7 && (
          <div
            className={`absolute -inset-4 bg-gradient-to-r ${getStreakGradient(streak.current)} opacity-10 rounded-2xl blur-lg`}
          />
        )}

        {/* Streak icon */}
        <div className="text-4xl mb-2 animate-pulse-gentle">
          {getStreakIcon(streak.current)}
        </div>

        {/* Current streak number */}
        <div className={`${classes.number} font-bold ${getStreakColor(streak.current)} mb-1 relative z-10`}>
          {streak.current}
        </div>

        {/* Streak label */}
        <div className={`${classes.label} text-gray-600 font-medium`}>
          {streak.current === 1 ? 'Day' : 'Days'}
        </div>

        {/* Streak message */}
        <div className={`${classes.details} ${getStreakColor(streak.current)} font-medium mt-2`}>
          {getStreakMessage(streak.current)}
        </div>
      </div>

      {/* Additional details */}
      {showDetails && (
        <div className="space-y-3">
          {/* Best streak */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className={`${classes.details} text-gray-600`}>
              Personal Best
            </span>
            <div className="flex items-center gap-1">
              <span className={`${classes.details} font-semibold text-gray-800`}>
                {streak.longest}
              </span>
              {streak.longest >= 7 && (
                <span className="text-sm">🏅</span>
              )}
            </div>
          </div>

          {/* Last activity */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className={`${classes.details} text-gray-600`}>
              Last Check-in
            </span>
            <span className={`${classes.details} font-semibold text-gray-800`}>
              {formatDate(streak.lastDate)}
            </span>
          </div>

          {/* Progress towards next milestone */}
          {streak.current > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`${classes.details} text-gray-600`}>
                  Next Milestone
                </span>
                <span className={`${classes.details} font-semibold text-gray-800`}>
                  {streak.current < 3 ? `${3 - streak.current} days` :
                   streak.current < 7 ? `${7 - streak.current} days` :
                   streak.current < 14 ? `${14 - streak.current} days` :
                   streak.current < 30 ? `${30 - streak.current} days` :
                   '🎯 Amazing!'}
                </span>
              </div>

              {/* Progress bar */}
              {streak.current < 30 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${getStreakGradient(streak.current)} transition-all duration-500`}
                    style={{
                      width: `${
                        streak.current < 3 ? (streak.current / 3) * 100 :
                        streak.current < 7 ? ((streak.current - 3) / 4) * 100 :
                        streak.current < 14 ? ((streak.current - 7) / 7) * 100 :
                        streak.current < 30 ? ((streak.current - 14) / 16) * 100 :
                        100
                      }%`
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Encouragement for starting */}
      {streak.current === 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className={`${classes.details} text-blue-700`}>
            🌟 Start your wellness journey today! Every small step counts.
          </p>
        </div>
      )}
    </div>
  );
}