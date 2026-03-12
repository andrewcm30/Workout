import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workoutTemplates } from '../data/templates'
import {
  getLastWorkoutForTemplate,
  getWeekWorkouts,
  getStreak,
  getNextWorkoutIndex,
  setNextWorkoutIndex,
  getActiveWorkout,
} from '../data/storage'
import { muscleGroupLabels } from '../data/coaching'

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays}d ago`
}

function getUniqueMuscleGroups(template) {
  const groups = new Set()
  for (const block of template.blocks) {
    for (const ex of block.exercises) {
      groups.add(ex.muscleGroup)
    }
  }
  return [...groups]
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const weekWorkouts = getWeekWorkouts()
  const streak = getStreak()
  const nextIndex = getNextWorkoutIndex()
  const activeWorkout = getActiveWorkout()

  // Auto-resume active workout when app relaunches
  useEffect(() => {
    if (activeWorkout) {
      navigate(`/workout/${activeWorkout.templateId}`, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = (templateId) => {
    const idx = workoutTemplates.findIndex((t) => t.id === templateId)
    setNextWorkoutIndex((idx + 1) % workoutTemplates.length)
    navigate(`/workout/${templateId}`)
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const weekDots = dayNames.map((name, i) => {
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + i)
    const dateStr = startOfWeek.toISOString().split('T')[0]
    const hasWorkout = weekWorkouts.some((w) => w.date.split('T')[0] === dateStr)
    const isToday = i === today.getDay()
    return { name, hasWorkout, isToday }
  })

  return (
    <div className="p-4 pt-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Let's Lift</h1>
          <p className="text-gray-600 text-sm mt-0.5">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 rounded-full px-3 py-1.5">
            <span className="text-brand text-sm font-bold">{streak}</span>
            <span className="text-brand/70 text-xs">day streak</span>
          </div>
        )}
      </div>

      {/* Week progress dots */}
      <div className="bg-surface rounded-2xl p-4 mb-5 border border-border">
        <div className="flex justify-between">
          {weekDots.map((day) => (
            <div key={day.name} className="flex flex-col items-center gap-2">
              <span className={`text-[10px] font-medium ${day.isToday ? 'text-brand' : 'text-gray-600'}`}>
                {day.name}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  day.hasWorkout
                    ? 'bg-brand text-white'
                    : day.isToday
                    ? 'border-2 border-brand/50 text-brand/50'
                    : 'bg-surface-2 border border-border text-gray-700'
                }`}
              >
                {day.hasWorkout && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs text-gray-600">{weekWorkouts.length} of 4 workouts this week</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i < weekWorkouts.length ? 'bg-brand' : 'bg-surface-3'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Resume button */}
      {activeWorkout && (
        <button
          onClick={() => navigate(`/workout/${activeWorkout.templateId}`)}
          className="w-full mb-4 bg-brand text-white rounded-2xl p-4 text-lg font-semibold active:opacity-90 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          Resume Workout
        </button>
      )}

      {/* Workout Templates */}
      <div className="space-y-3">
        {workoutTemplates.map((template, index) => {
          const last = getLastWorkoutForTemplate(template.id)
          const isNext = index === nextIndex
          const muscles = getUniqueMuscleGroups(template)
          const category = template.category

          return (
            <button
              key={template.id}
              onClick={() => handleStart(template.id)}
              className={`w-full text-left rounded-2xl p-4 active:scale-[0.98] transition-all border ${
                isNext
                  ? 'bg-brand/8 border-brand/30'
                  : 'bg-surface border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isNext && (
                      <span className="text-[10px] bg-brand text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Up Next
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                      category === 'upper'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-green-500/15 text-green-400'
                    }`}>
                      {category}
                    </span>
                  </div>
                  <p className="text-base font-bold">{template.name}</p>
                </div>
                <svg className="w-5 h-5 text-gray-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {muscles.map((m) => (
                  <span key={m} className="text-[10px] text-gray-500 bg-surface-2 px-2 py-0.5 rounded-full">
                    {muscleGroupLabels[m] || m}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{template.totalSets} sets</span>
                <span className="text-gray-700">&middot;</span>
                <span>{template.targetTime}</span>
                {last && (
                  <>
                    <span className="text-gray-700">&middot;</span>
                    <span>{formatTimeAgo(last.date)}</span>
                  </>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
