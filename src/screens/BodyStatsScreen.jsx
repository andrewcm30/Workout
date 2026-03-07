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

  const currentWeight = stats.length > 0 ? stats[stats.length - 1].weight : 220

  return (
    <div className="p-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Body Stats</h1>

      {/* Current stats */}
      <div className="flex gap-3 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex-1 text-center">
          <p className="text-2xl font-bold">{currentWeight}</p>
          <p className="text-xs text-gray-500">lbs</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex-1 text-center">
          <p className="text-2xl font-bold">6'3"</p>
          <p className="text-xs text-gray-500">Height</p>
        </div>
      </div>

      {/* Log weight */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
        <h3 className="font-bold mb-3">Log Weight</h3>
        <div className="flex gap-3">
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={currentWeight.toString()}
            className="flex-1 bg-[#252525] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium active:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
          <h3 className="text-sm text-gray-400 mb-3">Weight Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 10 }} />
              <YAxis stroke="#666" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      {stats.length > 0 && (
        <div>
          <h3 className="font-bold mb-3">History</h3>
          <div className="space-y-2">
            {[...stats].reverse().map((entry) => (
              <div key={entry.date} className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{entry.weight} lbs</span>
                  <span className="text-gray-500 text-sm ml-3">{entry.date}</span>
                </div>
                <button
                  onClick={() => setDeleteDate(entry.date)}
                  className="text-gray-600 text-xs active:text-red-400"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteDate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-xl font-bold">Delete Entry?</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteDate(null)}
                className="flex-1 bg-[#333] text-white py-3 rounded-xl font-medium active:bg-[#444]"
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
