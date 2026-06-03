'use client';

import { useEffect, useState } from 'react';

interface RateLimitStatus {
  remaining: number;
  limit: number;
  resetAt: number;
}

export function RateLimitWarning({ status }: { status: RateLimitStatus }) {
  const [secondsUntilReset, setSecondsUntilReset] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isLimited, setIsLimited] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const secondsLeft = Math.ceil((status.resetAt - now) / 1000);

      if (secondsLeft <= 0) {
        setSecondsUntilReset(0);
        setIsWarning(false);
        setIsLimited(false);
      } else {
        setSecondsUntilReset(secondsLeft);

        if (status.remaining === 0) {
          setIsLimited(true);
          setIsWarning(true);
        } else if (status.remaining <= Math.ceil(status.limit * 0.2)) {
          setIsWarning(true);
          setIsLimited(false);
        } else {
          setIsWarning(false);
          setIsLimited(false);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [status]);

  if (!isWarning) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 rounded-lg p-4 text-white ${
        isLimited ? 'bg-red-600' : 'bg-yellow-600'
      }`}
    >
      <div className="flex items-center gap-3">
        {isLimited ? (
          <>
            <span className="text-lg font-bold">⛔</span>
            <div>
              <p className="font-semibold">Rate Limit Exceeded</p>
              <p className="text-sm">
                Try again in {secondsUntilReset} seconds
              </p>
            </div>
          </>
        ) : (
          <>
            <span className="text-lg font-bold">⚠️</span>
            <div>
              <p className="font-semibold">Approaching Rate Limit</p>
              <p className="text-sm">
                {status.remaining} / {status.limit} requests remaining
              </p>
            </div>
          </>
        )}
      </div>

      {isLimited && (
        <div className="mt-3 bg-black bg-opacity-20 rounded p-2 text-xs">
          <code className="font-mono">
            Resets in {secondsUntilReset}s
          </code>
        </div>
      )}
    </div>
  );
}
