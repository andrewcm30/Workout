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
import { muscleGroupColors, muscleGroupLabels, getCoachingTip, getWeightSuggestion } from '../data/coaching'
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
  const [restExerciseName, setRestExerciseName] = useState(null)
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

  // Keep a ref to latest data so visibilitychange can access it
  const exerciseDataRef = useRef(exerciseData)
  useEffect(() => {
    exerciseDataRef.current = exerciseData
  }, [exerciseData])

  // Auto-save on state change
  useEffect(() => {
    saveActiveWorkout({ templateId, startTime, exerciseData })
  }, [exerciseData, templateId, startTime])

  // Save when app goes to background (covers mid-typing inputs)
  useEffect(() => {
    const handleVisChange = () => {
      if (document.visibilityState === 'hidden') {
        saveActiveWorkout({ templateId, startTime, exerciseData: exerciseDataRef.current })
      }
    }
    document.addEventListener('visibilitychange', handleVisChange)
    return () => document.removeEventListener('visibilitychange', handleVisChange)
  }, [templateId, startTime])

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

  const completeSet = (exerciseId, setIndex, block, exercise) => {
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
      setTimeout(() => setShowConfetti(false), 2500)
    }

    // Rest timer fires after every completed set
    setRestExerciseName(exercise.name)
    setRestTimer(block.restSeconds)
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
      exerciseCount: exercises.length,
      setCount: exercises.reduce((s, e) => s + e.sets.length, 0),
    })
  }

  if (summary) {
    return (
      <div className="p-4 pt-10 flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-brand/15 flex items-center justify-center">
          <svg className="w-10 h-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Workout Complete</h1>
          <p className="text-gray-500 text-sm mt-1">Great session. Keep it up.</p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <div className="bg-surface rounded-2xl p-5 border border-border space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Duration</span>
              <span className="font-bold text-lg tabular-nums">{formatTime(summary.duration)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Volume</span>
              <span className="font-bold text-lg">{summary.totalVolume.toLocaleString()} lbs</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Exercises</span>
              <span className="font-bold text-lg">{summary.exerciseCount}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Sets</span>
              <span className="font-bold text-lg">{summary.setCount}</span>
            </div>
            {summary.prCount > 0 && (
              <>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-brand text-sm font-medium">PRs Hit</span>
                  <span className="font-bold text-lg text-brand">{summary.prCount}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="bg-brand text-white px-10 py-3.5 rounded-2xl text-lg font-semibold active:opacity-90 mt-2"
        >
          Done
        </button>
      </div>
    )
  }

  const progressPct = template.totalSets > 0 ? (completedSets / template.totalSets) * 100 : 0

  return (
    <div className="pb-4" ref={scrollRef}>
      {/* Header */}
      <div className="sticky top-0 bg-[#050505]/95 backdrop-blur-md z-30 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFinish(true)}
              className="text-gray-500 active:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="text-base font-bold truncate">{template.name}</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-surface rounded-full px-3 py-1 border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-brand text-sm font-bold tabular-nums">{formatTime(elapsed)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-surface-2 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[11px] text-gray-500 tabular-nums font-medium">
            {completedSets}/{template.totalSets}
          </span>
        </div>
      </div>

      {/* Blocks */}
      <div className="p-4 space-y-4">
        {template.blocks.map((block) => (
          <div key={block.blockNumber} className="space-y-3">
            {/* Block header */}
            <div className="flex items-center gap-2 px-1">
              <div className={`h-px flex-1 ${block.type === 'superset' ? 'bg-brand/20' : 'bg-border'}`} />
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                {block.type === 'superset' ? block.label : `Block ${block.blockNumber}`}
              </span>
              <div className={`h-px flex-1 ${block.type === 'superset' ? 'bg-brand/20' : 'bg-border'}`} />
            </div>

            {block.type === 'superset' && (
              <div className="flex items-center justify-center gap-1.5 -mt-1">
                <svg className="w-3 h-3 text-brand/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                <span className="text-[10px] text-brand/50 font-medium">Superset</span>
              </div>
            )}

            {block.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                data={exerciseData[exercise.id]}
                block={block}
                onUpdate={(setIndex, field, value) =>
                  updateSet(exercise.id, setIndex, field, value)
                }
                onComplete={(setIndex) => completeSet(exercise.id, setIndex, block, exercise)}
                hasPR={prs.includes(exercise.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Finish button */}
      <div className="px-4 mt-2">
        <button
          onClick={() => setShowFinish(true)}
          className="w-full bg-green-600 text-white py-4 rounded-2xl text-lg font-bold active:bg-green-700 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Finish Workout
        </button>
      </div>

      {/* Rest Timer */}
      {restTimer && (
        <RestTimer
          seconds={restTimer}
          exerciseName={restExerciseName}
          onComplete={() => { setRestTimer(null); setRestExerciseName(null) }}
          onSkip={() => { setRestTimer(null); setRestExerciseName(null) }}
        />
      )}

      {/* Finish Confirmation */}
      {showFinish && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm space-y-4 border border-border">
            <h2 className="text-xl font-bold">Finish Workout?</h2>
            <p className="text-gray-400 text-sm">
              {completedSets} of {template.totalSets} sets completed.
              {completedSets < template.totalSets && ' Unfinished sets won\'t be saved.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinish(false)}
                className="flex-1 bg-surface-2 text-white py-3 rounded-xl font-medium active:bg-surface-3 border border-border"
              >
                Keep Going
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
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute confetti-piece"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: '-20px',
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                background: ['#f97316', '#eab308', '#ef4444', '#22c55e', '#3b82f6'][i % 5],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random()}s`,
              }}
            />
          ))}
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-slide-up">
              <p className="text-brand text-3xl font-black">NEW PR!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseCard({ exercise, data, block, onUpdate, onComplete, hasPR }) {
  const isDuration = exercise.repType === 'duration'
  const repLabel = isDuration ? 'sec' : 'reps'
  const colors = muscleGroupColors[exercise.muscleGroup] || muscleGroupColors.chest
  const groupLabel = muscleGroupLabels[exercise.muscleGroup] || exercise.muscleGroup

  const completedCount = data.sets.filter((s) => s.completed).length
  const allDone = completedCount === data.sets.length

  // Coaching
  const coachTip = getCoachingTip(exercise, data.sets)
  const weightSuggestion = getWeightSuggestion(exercise, data.lastSets)

  return (
    <div className={`bg-surface rounded-2xl border overflow-hidden ${
      hasPR ? 'border-brand/40 glow-pulse' : allDone ? 'border-green-500/20' : 'border-border'
    }`}>
      {/* Exercise header */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                {groupLabel}
              </span>
              {hasPR && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand/15 text-brand">
                  PR
                </span>
              )}
            </div>
            <h3 className="text-[15px] font-bold leading-tight">{exercise.name}</h3>
          </div>
          {/* Mini progress ring */}
          <div className="relative w-9 h-9 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#1a1a1a" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke={allDone ? '#22c55e' : '#f97316'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - completedCount / data.sets.length)}`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-400">
              {completedCount}/{data.sets.length}
            </span>
          </div>
        </div>

        {/* Target rep range */}
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            <span className="text-xs text-gray-500">
              {exercise.repRange} {repLabel}
              {exercise.perSide && ' /side'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-500">{block.restSeconds}s rest</span>
          </div>
        </div>

        {/* Weight suggestion from last session */}
        {weightSuggestion && completedCount === 0 && (
          <div className="flex items-center gap-1.5 mt-1 animate-slide-up">
            <svg className="w-3 h-3 text-brand/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
            <span className="text-[11px] text-brand/70">
              Try {weightSuggestion.suggested} lbs — {weightSuggestion.reason}
            </span>
          </div>
        )}
      </div>

      {/* Sets */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-[1.5rem_1fr_1fr_2.75rem] gap-1.5 text-[10px] text-gray-600 px-0.5 mb-1.5 font-medium uppercase tracking-wider">
          <span></span>
          <span>lbs</span>
          <span>{isDuration ? 'sec' : 'reps'}</span>
          <span></span>
        </div>
        <div className="space-y-1.5">
          {data.sets.map((set, i) => (
            <div key={i} className={`grid grid-cols-[1.5rem_1fr_1fr_2.75rem] gap-1.5 items-center ${
              set.completed ? 'opacity-60' : ''
            }`}>
              <span className={`text-center text-xs font-bold ${
                set.completed ? 'text-green-500' : 'text-gray-600'
              }`}>
                {i + 1}
              </span>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={set.weight}
                  onChange={(e) => onUpdate(i, 'weight', e.target.value)}
                  onBlur={(e) => onUpdate(i, 'weight', e.target.value)}
                  disabled={set.completed}
                  placeholder={data.lastSets[i]?.weight?.toString() || '—'}
                  className={`w-full rounded-lg px-2 py-2.5 text-center text-sm font-medium disabled:opacity-60 placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand ${
                    set.completed ? 'bg-green-500/10 text-green-400' : 'bg-surface-2'
                  }`}
                />
              </div>
              <input
                type="number"
                inputMode="numeric"
                value={set.reps}
                onChange={(e) => onUpdate(i, 'reps', e.target.value)}
                onBlur={(e) => onUpdate(i, 'reps', e.target.value)}
                disabled={set.completed}
                placeholder={data.lastSets[i]?.reps?.toString() || '—'}
                className={`w-full rounded-lg px-2 py-2.5 text-center text-sm font-medium disabled:opacity-60 placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand ${
                  set.completed ? 'bg-green-500/10 text-green-400' : 'bg-surface-2'
                }`}
              />
              <button
                onClick={() => onComplete(i)}
                disabled={set.completed || (!set.weight && !set.reps)}
                className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
                  set.completed
                    ? 'bg-green-600 text-white'
                    : 'bg-surface-2 text-gray-600 active:bg-brand active:text-white'
                } disabled:opacity-20`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Last session reference */}
        {data.lastSets.length > 0 && completedCount === 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <span className="text-[10px] text-gray-600">
              Last: {data.lastSets.map((s, i) => `${s.weight}x${s.reps}`).join(', ')}
            </span>
          </div>
        )}

        {/* Coaching tip */}
        {coachTip && (
          <div className={`mt-2.5 p-2.5 rounded-xl animate-slide-up ${
            coachTip.type === 'increase'
              ? 'bg-brand/10 border border-brand/20'
              : coachTip.type === 'maintain'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-surface-2 border border-border'
          }`}>
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">
                {coachTip.type === 'increase' ? '📈' : coachTip.type === 'maintain' ? '💪' : '🎯'}
              </span>
              <span className={`text-[11px] leading-snug ${
                coachTip.type === 'increase' ? 'text-brand' : coachTip.type === 'maintain' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {coachTip.message}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
