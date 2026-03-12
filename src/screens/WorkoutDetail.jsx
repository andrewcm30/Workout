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

function getExerciseMuscle(exerciseId) {
  for (const t of workoutTemplates) {
    for (const b of t.blocks) {
      for (const e of b.exercises) {
        if (e.id === exerciseId) return e.muscleGroup
      }
    }
  }
  return null
}

const muscleColors = {
  chest: 'text-red-400',
  back: 'text-blue-400',
  shoulders: 'text-orange-400',
  quads: 'text-green-400',
  hamstrings: 'text-emerald-400',
  biceps: 'text-purple-400',
  triceps: 'text-pink-400',
  core: 'text-yellow-400',
  calves: 'text-teal-400',
  rear_delts: 'text-amber-400',
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
        <button onClick={() => navigate('/history')} className="text-brand mt-4 text-sm font-medium">
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
      <button onClick={() => navigate('/history')} className="text-brand text-sm mb-4 flex items-center gap-1 font-medium active:opacity-70">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        History
      </button>

      <h1 className="text-xl font-bold mb-0.5">{template?.name || workout.templateId}</h1>
      <p className="text-gray-600 text-sm mb-5">{formatDate(workout.date)}</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface rounded-2xl px-4 py-3 text-center border border-border">
          <p className="font-bold text-lg tabular-nums">{formatDuration(workout.duration)}</p>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Duration</p>
        </div>
        <div className="bg-surface rounded-2xl px-4 py-3 text-center border border-border">
          <p className="font-bold text-lg">{workout.totalVolume.toLocaleString()}</p>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Volume (lbs)</p>
        </div>
      </div>

      <div className="space-y-3">
        {workout.exercises.map((ex) => {
          const muscle = getExerciseMuscle(ex.exerciseId)
          const colorClass = muscleColors[muscle] || 'text-gray-400'
          return (
            <div key={ex.exerciseId} className="bg-surface rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-[15px]">{getExerciseName(ex.exerciseId)}</h3>
              </div>
              <div className="space-y-1.5">
                {ex.sets.map((set, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 w-5 text-center text-xs font-bold">{set.setNumber}</span>
                    <div className="flex-1 flex items-center gap-1">
                      <span className="font-medium">{set.weight}</span>
                      <span className="text-gray-600 text-xs">lbs</span>
                      <span className="text-gray-700 mx-1">&times;</span>
                      <span className="font-medium">{set.reps}</span>
                      <span className="text-gray-600 text-xs">reps</span>
                    </div>
                    {set.isPR && (
                      <span className="text-[10px] bg-brand/15 text-brand px-2 py-0.5 rounded-full font-bold">PR</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
