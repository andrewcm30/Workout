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

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const weekWorkouts = getWeekWorkouts()
  const streak = getStreak()
  const nextIndex = getNextWorkoutIndex()
  const activeWorkout = getActiveWorkout()

  const handleStart = (templateId) => {
    const idx = workoutTemplates.findIndex((t) => t.id === templateId)
    setNextWorkoutIndex((idx + 1) % workoutTemplates.length)
    navigate(`/workout/${templateId}`)
  }

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-bold mb-1">Workout Tracker</h1>
      <p className="text-gray-500 text-sm mb-6">Ready to train?</p>

      <div className="flex gap-3 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex-1 text-center">
          <p className="text-2xl font-bold text-blue-500">{weekWorkouts.length}</p>
          <p className="text-xs text-gray-500">This Week</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex-1 text-center">
          <p className="text-2xl font-bold text-green-500">{streak}</p>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>
      </div>

      {activeWorkout && (
        <button
          onClick={() => navigate(`/workout/${activeWorkout.templateId}`)}
          className="w-full mb-4 bg-blue-600 text-white rounded-xl p-4 text-lg font-semibold active:bg-blue-700"
        >
          Resume Workout
        </button>
      )}

      <div className="space-y-3">
        {workoutTemplates.map((template, index) => {
          const last = getLastWorkoutForTemplate(template.id)
          const isNext = index === nextIndex
          return (
            <button
              key={template.id}
              onClick={() => handleStart(template.id)}
              className={`w-full text-left rounded-xl p-5 active:scale-[0.98] transition-transform ${
                isNext
                  ? 'bg-blue-600/15 border-2 border-blue-500'
                  : 'bg-[#1a1a1a] border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{template.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {template.totalSets} sets &middot; {template.targetTime}
                  </p>
                  {last && (
                    <p className="text-xs text-gray-600 mt-1">
                      Last: {formatTimeAgo(last.date)}
                    </p>
                  )}
                </div>
                {isNext && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                    Next
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
