import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getBodyStats, saveBodyStat, deleteBodyStat } from '../data/storage'

export default function BodyStatsScreen() {
  const [stats, setStats] = useState(getBodyStats)
  const [weight, setWeight] = useState('')
  const [deleteDate, setDeleteDate] = useState(null)

  const handleAdd = () => {
    const w = parseFloat(weight)
    if (!w || w <= 0) return
    const today = new Date().toISOString().split('T')[0]
    saveBodyStat({ date: today, weight: w, unit: 'lbs' })
    setStats(getBodyStats())
    setWeight('')
  }

  const handleDelete = (date) => {
    deleteBodyStat(date)
    setStats(getBodyStats())
    setDeleteDate(null)
  }

  const chartData = stats.map((s) => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: s.weight,
  }))

  const currentWeight = stats.length > 0 ? stats[stats.length - 1].weight : null
  const prevWeight = stats.length > 1 ? stats[stats.length - 2].weight : null
  const weightDiff = currentWeight && prevWeight ? (currentWeight - prevWeight).toFixed(1) : null

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Body Stats</h1>
      <p className="text-gray-600 text-sm mb-5">Track your body composition</p>

      {/* Current stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-surface rounded-2xl p-4 text-center border border-border">
          <p className="text-3xl font-bold tabular-nums">{currentWeight || '—'}</p>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mt-1">lbs</p>
          {weightDiff && (
            <p className={`text-xs mt-1 font-medium ${
              parseFloat(weightDiff) > 0 ? 'text-green-400' : parseFloat(weightDiff) < 0 ? 'text-red-400' : 'text-gray-500'
            }`}>
              {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff} lbs
            </p>
          )}
        </div>
        <div className="bg-surface rounded-2xl p-4 text-center border border-border">
          <p className="text-3xl font-bold">6'3"</p>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mt-1">Height</p>
        </div>
      </div>

      {/* Log weight */}
      <div className="bg-surface rounded-2xl p-4 mb-5 border border-border">
        <h3 className="font-bold text-sm mb-3">Log Today's Weight</h3>
        <div className="flex gap-3">
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={currentWeight?.toString() || ''}
            className="flex-1 bg-surface-2 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-gray-700 border border-border"
          />
          <button
            onClick={handleAdd}
            className="bg-brand text-white px-6 py-3 rounded-xl font-medium active:opacity-90 text-sm"
          >
            Save
          </button>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-surface rounded-2xl p-4 mb-5 border border-border">
          <h3 className="text-xs text-gray-500 mb-3 font-medium">Weight Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }} />
              <YAxis stroke="#444" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: '#f97316', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#f97316' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      {stats.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3">History</h3>
          <div className="space-y-1.5">
            {[...stats].reverse().map((entry) => (
              <div key={entry.date} className="bg-surface rounded-xl px-4 py-3 flex justify-between items-center border border-border">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm tabular-nums">{entry.weight}</span>
                  <span className="text-gray-600 text-xs">lbs</span>
                  <span className="text-gray-700 text-xs">{entry.date}</span>
                </div>
                <button
                  onClick={() => setDeleteDate(entry.date)}
                  className="text-gray-700 text-xs active:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteDate && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm space-y-4 border border-border">
            <h2 className="text-xl font-bold">Delete Entry?</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteDate(null)}
                className="flex-1 bg-surface-2 text-white py-3 rounded-xl font-medium active:bg-surface-3 border border-border"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteDate)}
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
