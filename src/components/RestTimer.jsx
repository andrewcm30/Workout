import { useState, useEffect, useRef } from 'react'

export default function RestTimer({ seconds, onComplete, onSkip }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          // Vibrate when timer completes
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40">
      <div className="bg-[#1a1a1a] rounded-2xl p-8 flex flex-col items-center gap-6 mx-4 w-full max-w-sm">
        <p className="text-gray-400 text-lg">Rest Timer</p>
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold tabular-nums">
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            clearInterval(intervalRef.current)
            onSkip()
          }}
          className="bg-[#333] text-white px-8 py-3 rounded-xl text-lg font-medium active:bg-[#444]"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
