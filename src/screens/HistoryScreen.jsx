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
      <h1 className="text-2xl font-bold mb-6">History</h1>

      {sortedHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No workouts yet</p>
          <p className="text-gray-600 text-sm mt-2">Complete your first workout to see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedHistory.map((workout) => {
            const template = getTemplate(workout.templateId)
            return (
              <div
                key={workout.id}
                className="bg-[#1a1a1a] rounded-xl p-4 active:bg-[#222]"
              >
                <button
                  onClick={() => navigate(`/history/${workout.id}`)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold">{template?.name || workout.templateId}</h3>
                    <span className="text-xs text-gray-500">{formatDate(workout.date)}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>{formatDuration(workout.duration)}</span>
                    <span>{workout.totalVolume.toLocaleString()} lbs</span>
                    <span>{workout.exercises.reduce((s, e) => s + e.sets.length, 0)} sets</span>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteId(workout.id)
                  }}
                  className="mt-2 text-xs text-red-400 active:text-red-300"
                >
                  Delete
                </button>
              </div>
            )
          })}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-xl font-bold">Delete Workout?</h2>
            <p className="text-gray-400">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-[#333] text-white py-3 rounded-xl font-medium active:bg-[#444]"
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
