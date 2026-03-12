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
  const [chartType, setChartType] = useState('weight')

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

  const history = getWorkoutHistory()
  const volumeData = [...history]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((w) => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: w.totalVolume,
    }))

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Progress</h1>
      <p className="text-gray-600 text-sm mb-5">Track your gains over time</p>

      {/* Exercise selector */}
      <div className="relative mb-4">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full bg-surface text-white rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand border border-border appearance-none"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Chart type tabs */}
      <div className="flex gap-1.5 mb-4 bg-surface rounded-xl p-1 border border-border">
        {[
          { key: 'weight', label: 'Top Set' },
          { key: 'e1rm', label: 'Est 1RM' },
          { key: 'volume', label: 'Volume' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setChartType(tab.key)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              chartType === tab.key ? 'bg-brand text-white' : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="bg-surface rounded-2xl p-4 mb-5 border border-border">
          <h3 className="text-xs text-gray-500 mb-3 font-medium">
            {selected?.name} — {chartType === 'weight' ? 'Top Set Weight' : chartType === 'e1rm' ? 'Estimated 1RM' : 'Volume'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartType === 'volume' && selectedId === '__all__' ? volumeData : chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }} />
              <YAxis stroke="#444" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey={chartType}
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#f97316' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl p-10 text-center mb-5 border border-border">
          <p className="text-gray-600 text-sm">No data for this exercise yet</p>
        </div>
      )}

      {/* Session Volume Chart */}
      {volumeData.length > 0 && (
        <div className="bg-surface rounded-2xl p-4 border border-border">
          <h3 className="text-xs text-gray-500 mb-3 font-medium">Session Volume Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }} />
              <YAxis stroke="#444" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#22c55e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
