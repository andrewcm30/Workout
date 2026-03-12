import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkoutHistory, deleteWorkout } from '../data/storage'
import { getTemplate } from '../data/templates'

export default function HistoryScreen() {
  const navigate = useNavigate()
  const [history, setHistory] = useState(getWorkoutHistory)
  const [deleteId, setDeleteId] = useState(null)

  const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date))

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatDuration = (s) => {
    const m = Math.floor(s / 60)
    return `${m} min`
  }

  const handleDelete = (id) => {
    deleteWorkout(id)
    setHistory(getWorkoutHistory())
    setDeleteId(null)
  }

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-bold tracking-tight mb-1">History</h1>
      <p className="text-gray-600 text-sm mb-5">{sortedHistory.length} workouts logged</p>

      {sortedHistory.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-base font-medium">No workouts yet</p>
          <p className="text-gray-700 text-sm mt-1">Complete a workout to see it here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedHistory.map((workout) => {
            const template = getTemplate(workout.templateId)
            const setCount = workout.exercises.reduce((s, e) => s + e.sets.length, 0)
            const hasPR = workout.exercises.some((e) => e.sets.some((s) => s.isPR))
            return (
              <div
                key={workout.id}
                className="bg-surface rounded-2xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => navigate(`/history/${workout.id}`)}
                  className="w-full text-left p-4 active:bg-surface-2 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-[15px]">{template?.name || workout.templateId}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{formatDate(workout.date)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasPR && (
                        <span className="text-[10px] bg-brand/15 text-brand px-2 py-0.5 rounded-full font-bold">PR</span>
                      )}
                      <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(workout.duration)}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
                      </svg>
                      {workout.totalVolume.toLocaleString()} lbs
                    </div>
                    <span className="text-gray-500">{setCount} sets</span>
                  </div>
                </button>
                <div className="px-4 pb-3">
                  <button
                    onClick={() => setDeleteId(workout.id)}
                    className="text-[11px] text-gray-700 active:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm space-y-4 border border-border">
            <h2 className="text-xl font-bold">Delete Workout?</h2>
            <p className="text-gray-500 text-sm">This can't be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-surface-2 text-white py-3 rounded-xl font-medium active:bg-surface-3 border border-border"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium active:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
