import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTemplate } from '../data/templates'
import {
  getLastWorkoutForTemplate,
  saveWorkout,
  saveActiveWorkout,
  getActiveWorkout,
  clearActiveWorkout,
  checkForPR,
} from '../data/storage'
import RestTimer from '../components/RestTimer'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export default function ActiveWorkout() {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const template = getTemplate(templateId)
  const [startTime] = useState(() => {
    const active = getActiveWorkout()
    if (active && active.templateId === templateId) return active.startTime
    return Date.now()
  })
  const [elapsed, setElapsed] = useState(0)
  const initExerciseData = () => {
    const active = getActiveWorkout()
    if (active && active.templateId === templateId) return active.exerciseData

    const lastWorkout = getLastWorkoutForTemplate(templateId)
    const data = {}
    for (const templateBlock of template.blocks) {
      for (const exercise of templateBlock.exercises) {
        const lastExercise = lastWorkout?.exercises.find((e) => e.exerciseId === exercise.id)
        const sets = []
        for (let i = 0; i < exercise.sets; i++) {
          const lastSet = lastExercise?.sets[i]
          sets.push({
            weight: lastSet?.weight ?? '',
            reps: lastSet?.reps ?? '',
            completed: false,
          })
        }
        data[exercise.id] = { sets, lastSets: lastExercise?.sets || [] }
      }
    }
    return data
  }
  const [exerciseData, setExerciseData] = useState(() => initExerciseData())
  const [restTimer, setRestTimer] = useState(null)
  const [showFinish, setShowFinish] = useState(false)
  const [summary, setSummary] = useState(null)
  const [prs, setPrs] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)
  const scrollRef = useRef(null)

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  // Auto-save
  useEffect(() => {
    saveActiveWorkout({ templateId, startTime, exerciseData })
  }, [exerciseData, templateId, startTime])

  if (!template) {
    navigate('/')
    return null
  }

  const completedSets = Object.values(exerciseData).reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0
  )

  const updateSet = (exerciseId, setIndex, field, value) => {
    setExerciseData((prev) => {
      const newData = { ...prev }
      const sets = [...newData[exerciseId].sets]
      sets[setIndex] = { ...sets[setIndex], [field]: value }
      newData[exerciseId] = { ...newData[exerciseId], sets }
      return newData
    })
  }

  const completeSet = (exerciseId, setIndex, block) => {
    setExerciseData((prev) => {
      const newData = { ...prev }
      const sets = [...newData[exerciseId].sets]
      sets[setIndex] = { ...sets[setIndex], completed: true }
      newData[exerciseId] = { ...newData[exerciseId], sets }
      return newData
    })

    // Check PR
    const set = exerciseData[exerciseId].sets[setIndex]
    const w = parseFloat(set.weight) || 0
    const r = parseInt(set.reps) || 0
    if (w > 0 && r > 0 && checkForPR(exerciseId, w, r)) {
      setPrs((prev) => [...prev, exerciseId])
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }

    // Determine if rest timer should start
    if (block.type === 'straight') {
      setRestTimer(block.restSeconds)
    } else {
      // For supersets, check if we just completed the last exercise in the group
      const lastExercise = block.exercises[block.exercises.length - 1]
      if (exerciseId === lastExercise.id) {
        setRestTimer(block.restSeconds)
      }
    }
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const finishWorkout = () => {
    const exercises = []
    let totalVolume = 0
    for (const block of template.blocks) {
      for (const exercise of block.exercises) {
        const ex = exerciseData[exercise.id]
        const completedSets = ex.sets
          .filter((s) => s.completed)
          .map((s, i) => {
            const w = parseFloat(s.weight) || 0
            const r = parseInt(s.reps) || 0
            totalVolume += w * r
            return {
              setNumber: i + 1,
              weight: w,
              reps: r,
              isPR: prs.includes(exercise.id),
            }
          })
        if (completedSets.length > 0) {
          exercises.push({ exerciseId: exercise.id, sets: completedSets })
        }
      }
    }

    const workout = {
      id: generateId(),
      templateId,
      date: new Date().toISOString(),
      duration: elapsed,
      totalVolume,
      exercises,
    }

    saveWorkout(workout)
    clearActiveWorkout()

    setSummary({
      duration: elapsed,
      totalVolume,
      prCount: prs.length,
    })
  }

  if (summary) {
    return (
      <div className="p-4 pt-12 flex flex-col items-center gap-6">
        <div className="text-6xl">&#127942;</div>
        <h1 className="text-2xl font-bold">Workout Complete!</h1>
        <div className="bg-[#1a1a1a] rounded-xl p-6 w-full max-w-sm space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Duration</span>
            <span className="font-bold">{formatTime(summary.duration)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Volume</span>
            <span className="font-bold">{summary.totalVolume.toLocaleString()} lbs</span>
          </div>
          {summary.prCount > 0 && (
            <div className="flex justify-between">
              <span className="text-amber-400">PRs Hit</span>
              <span className="font-bold text-amber-400">{summary.prCount}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl text-lg font-semibold active:bg-blue-700"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="pb-4" ref={scrollRef}>
      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-30 p-4 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold truncate flex-1">{template.name}</h1>
          <span className="text-blue-400 tabular-nums ml-2">{formatTime(elapsed)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#222] rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(completedSets / template.totalSets) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 tabular-nums">
            {completedSets}/{template.totalSets}
          </span>
        </div>
      </div>

      {/* Blocks */}
      <div className="p-4 space-y-6">
        {template.blocks.map((block) => (
          <div
            key={block.blockNumber}
            className={`rounded-xl overflow-hidden ${
              block.type === 'superset'
                ? 'border-l-4 border-blue-500 bg-[#1a1a1a]'
                : 'bg-[#1a1a1a]'
            }`}
          >
            <div className="px-4 pt-3 pb-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                Block {block.blockNumber}
                {block.type === 'superset' ? ` — ${block.label}` : ' — Straight Set'}
              </p>
            </div>

            {block.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                data={exerciseData[exercise.id]}
                block={block}
                onUpdate={(setIndex, field, value) =>
                  updateSet(exercise.id, setIndex, field, value)
                }
                onComplete={(setIndex) => completeSet(exercise.id, setIndex, block)}
                hasPR={prs.includes(exercise.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Finish button */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setShowFinish(true)}
          className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-semibold active:bg-green-700"
        >
          Finish Workout
        </button>
      </div>

      {/* Rest Timer */}
      {restTimer && (
        <RestTimer
          seconds={restTimer}
          onComplete={() => setRestTimer(null)}
          onSkip={() => setRestTimer(null)}
        />
      )}

      {/* Finish Confirmation */}
      {showFinish && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-xl font-bold">Finish Workout?</h2>
            <p className="text-gray-400">
              You've completed {completedSets} of {template.totalSets} sets.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinish(false)}
                className="flex-1 bg-[#333] text-white py-3 rounded-xl font-medium active:bg-[#444]"
              >
                Cancel
              </button>
              <button
                onClick={finishWorkout}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium active:bg-green-700"
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PR Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center animate-bounce">
            <p className="text-6xl">&#127881;</p>
            <p className="text-amber-400 text-2xl font-bold mt-2">New PR!</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseCard({ exercise, data, onUpdate, onComplete, hasPR }) {
  const isDuration = exercise.repType === 'duration'
  const repLabel = isDuration ? 'sec' : 'reps'

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold flex-1">
          {exercise.name}
          {hasPR && <span className="ml-2 text-amber-400 text-sm">&#9733; PR</span>}
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-3">
        Target: {exercise.repRange} {repLabel}
        {exercise.perSide && ' (each side)'}
      </p>

      <div className="space-y-2">
        <div className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 text-xs text-gray-500 px-1">
          <span>Set</span>
          <span>Weight (lbs)</span>
          <span>{isDuration ? 'Seconds' : 'Reps'}</span>
          <span></span>
        </div>
        {data.sets.map((set, i) => (
          <div key={i} className="grid grid-cols-[2rem_1fr_1fr_3rem] gap-2 items-center">
            <span className={`text-center text-sm font-medium ${set.completed ? 'text-green-500' : 'text-gray-500'}`}>
              {i + 1}
            </span>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={set.weight}
                onChange={(e) => onUpdate(i, 'weight', e.target.value)}
                disabled={set.completed}
                placeholder={data.lastSets[i]?.weight?.toString() || ''}
                className="w-full bg-[#252525] rounded-lg px-3 py-3 text-center text-base font-medium disabled:opacity-50 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {data.lastSets[i] && !set.completed && (
                <span className="absolute -bottom-4 left-0 text-[10px] text-gray-600">
                  Last: {data.lastSets[i].weight} x {data.lastSets[i].reps}
                </span>
              )}
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={set.reps}
              onChange={(e) => onUpdate(i, 'reps', e.target.value)}
              disabled={set.completed}
              placeholder={data.lastSets[i]?.reps?.toString() || ''}
              className="w-full bg-[#252525] rounded-lg px-3 py-3 text-center text-base font-medium disabled:opacity-50 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => onComplete(i)}
              disabled={set.completed || (!set.weight && !set.reps)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                set.completed
                  ? 'bg-green-600 text-white'
                  : 'bg-[#252525] text-gray-500 active:bg-[#333]'
              } disabled:opacity-30`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
