import { useState, useEffect, useRef } from 'react'

export default function RestTimer({ seconds, exerciseName, onComplete, onSkip }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [seconds, onComplete])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const progress = ((seconds - remaining) / seconds) * 100
  const circumference = 2 * Math.PI * 45
  const isLow = remaining <= 5

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-40 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl p-8 flex flex-col items-center gap-5 mx-4 w-full max-w-sm border border-border">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Rest</p>
        {exerciseName && (
          <p className="text-gray-500 text-xs -mt-3">{exerciseName}</p>
        )}

        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1a1a" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={isLow ? '#ef4444' : '#f97316'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              className="transition-all duration-1000 linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold tabular-nums ${isLow ? 'text-red-400' : 'text-white'}`}>
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => {
              clearInterval(intervalRef.current)
              onSkip()
            }}
            className="flex-1 bg-surface-2 text-gray-300 py-3.5 rounded-xl text-base font-medium active:bg-surface-3 border border-border"
          >
            Skip
          </button>
          <button
            onClick={() => {
              clearInterval(intervalRef.current)
              setRemaining((prev) => prev + 30)
              intervalRef.current = setInterval(() => {
                setRemaining((p) => {
                  if (p <= 1) {
                    clearInterval(intervalRef.current)
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200])
                    onComplete()
                    return 0
                  }
                  return p - 1
                })
              }, 1000)
            }}
            className="flex-1 bg-brand/15 text-brand py-3.5 rounded-xl text-base font-medium active:bg-brand/25 border border-brand/30"
          >
            +30s
          </button>
        </div>
      </div>
    </div>
  )
}
