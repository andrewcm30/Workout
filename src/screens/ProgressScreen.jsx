import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getWorkoutsForExercise, calculate1RM, getWorkoutHistory } from '../data/storage'
import { workoutTemplates } from '../data/templates'

function getAllExercises() {
  const seen = new Set()
  const exercises = []
  for (const t of workoutTemplates) {
    for (const b of t.blocks) {
      for (const e of b.exercises) {
        if (!seen.has(e.id)) {
          seen.add(e.id)
          exercises.push({ id: e.id, name: e.name, repType: e.repType })
        }
      }
    }
  }
  return exercises
}

export default function ProgressScreen() {
  const exercises = getAllExercises()
  const [selectedId, setSelectedId] = useState(exercises[0]?.id || '')
  const [chartType, setChartType] = useState('weight') // weight | volume | e1rm

  const selected = exercises.find((e) => e.id === selectedId)
  const data = getWorkoutsForExercise(selectedId)

  const chartData = data.map((entry) => {
    const topSet = entry.sets.reduce(
      (best, s) => (s.weight > best.weight ? s : best),
      { weight: 0, reps: 0 }
    )
    const volume = entry.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
    return {
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: topSet.weight,
      reps: topSet.reps,
      volume,
      e1rm: calculate1RM(topSet.weight, topSet.reps),
    }
  })

  // Volume over time (per workout)
  const history = getWorkoutHistory()
  const volumeData = [...history]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((w) => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: w.totalVolume,
    }))

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Progress</h1>

      {/* Exercise selector */}
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full bg-[#1a1a1a] text-white rounded-xl px-4 py-3 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>

      {/* Chart type tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'weight', label: 'Top Set' },
          { key: 'e1rm', label: 'Est 1RM' },
          { key: 'volume', label: 'Volume' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setChartType(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              chartType === tab.key ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
          <h3 className="text-sm text-gray-400 mb-3">
            {selected?.name} — {chartType === 'weight' ? 'Top Set Weight' : chartType === 'e1rm' ? 'Estimated 1RM' : 'Volume'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartType === 'volume' && selectedId === '__all__' ? volumeData : chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey={chartType}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] rounded-xl p-8 text-center mb-6">
          <p className="text-gray-500">No data for this exercise yet</p>
        </div>
      )}

      {/* Session Volume Chart */}
      {volumeData.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl p-4">
          <h3 className="text-sm text-gray-400 mb-3">Session Volume Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
