import { useParams, useNavigate } from 'react-router-dom'
import { getWorkoutHistory } from '../data/storage'
import { getTemplate, workoutTemplates } from '../data/templates'

function getExerciseName(exerciseId) {
  for (const t of workoutTemplates) {
    for (const b of t.blocks) {
      for (const e of b.exercises) {
        if (e.id === exerciseId) return e.name
      }
    }
  }
  return exerciseId
}

export default function WorkoutDetail() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const history = getWorkoutHistory()
  const workout = history.find((w) => w.id === workoutId)

  if (!workout) {
    return (
      <div className="p-4 pt-6">
        <p className="text-gray-500">Workout not found.</p>
        <button onClick={() => navigate('/history')} className="text-blue-500 mt-4">
          Back to History
        </button>
      </div>
    )
  }

  const template = getTemplate(workout.templateId)
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  const formatDuration = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 pt-6">
      <button onClick={() => navigate('/history')} className="text-blue-500 text-sm mb-4 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        History
      </button>

      <h1 className="text-xl font-bold mb-1">{template?.name || workout.templateId}</h1>
      <p className="text-gray-500 text-sm mb-4">{formatDate(workout.date)}</p>

      <div className="flex gap-4 mb-6 text-sm">
        <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex-1 text-center">
          <p className="font-bold">{formatDuration(workout.duration)}</p>
          <p className="text-xs text-gray-500">Duration</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex-1 text-center">
          <p className="font-bold">{workout.totalVolume.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Volume (lbs)</p>
        </div>
      </div>

      <div className="space-y-4">
        {workout.exercises.map((ex) => (
          <div key={ex.exerciseId} className="bg-[#1a1a1a] rounded-xl p-4">
            <h3 className="font-bold mb-2">{getExerciseName(ex.exerciseId)}</h3>
            <div className="space-y-1">
              {ex.sets.map((set, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 w-6 text-center">{set.setNumber}</span>
                  <span className="flex-1">{set.weight} lbs x {set.reps}</span>
                  {set.isPR && <span className="text-amber-400 text-xs">&#9733; PR</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
