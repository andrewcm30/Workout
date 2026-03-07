const WORKOUTS_KEY = 'workout_history'
const BODY_STATS_KEY = 'body_stats'
const ACTIVE_WORKOUT_KEY = 'active_workout'
const ROTATION_KEY = 'next_workout_index'

// Completed workouts
export function getWorkoutHistory() {
  const data = localStorage.getItem(WORKOUTS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveWorkout(workout) {
  const history = getWorkoutHistory()
  history.push(workout)
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(history))
}

export function deleteWorkout(id) {
  const history = getWorkoutHistory().filter((w) => w.id !== id)
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(history))
}

export function getLastWorkoutForTemplate(templateId) {
  const history = getWorkoutHistory()
  const matching = history.filter((w) => w.templateId === templateId)
  if (matching.length === 0) return null
  return matching[matching.length - 1]
}

export function getWorkoutsForExercise(exerciseId) {
  const history = getWorkoutHistory()
  const results = []
  for (const workout of history) {
    const ex = workout.exercises.find((e) => e.exerciseId === exerciseId)
    if (ex) {
      results.push({ date: workout.date, sets: ex.sets })
    }
  }
  return results
}

// Active workout (for resume)
export function saveActiveWorkout(data) {
  localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(data))
}

export function getActiveWorkout() {
  const data = localStorage.getItem(ACTIVE_WORKOUT_KEY)
  return data ? JSON.parse(data) : null
}

export function clearActiveWorkout() {
  localStorage.removeItem(ACTIVE_WORKOUT_KEY)
}

// Body stats
export function getBodyStats() {
  const data = localStorage.getItem(BODY_STATS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveBodyStat(entry) {
  const stats = getBodyStats()
  stats.push(entry)
  stats.sort((a, b) => a.date.localeCompare(b.date))
  localStorage.setItem(BODY_STATS_KEY, JSON.stringify(stats))
}

export function deleteBodyStat(date) {
  const stats = getBodyStats().filter((s) => s.date !== date)
  localStorage.setItem(BODY_STATS_KEY, JSON.stringify(stats))
}

// Workout rotation
export function getNextWorkoutIndex() {
  const data = localStorage.getItem(ROTATION_KEY)
  return data ? parseInt(data, 10) : 0
}

export function setNextWorkoutIndex(index) {
  localStorage.setItem(ROTATION_KEY, String(index))
}

// PR detection
export function checkForPR(exerciseId, weight, reps) {
  const history = getWorkoutsForExercise(exerciseId)
  for (const entry of history) {
    for (const set of entry.sets) {
      if (set.weight >= weight && set.reps >= reps) return false
      if (set.weight === weight && set.reps >= reps) return false
    }
  }
  if (history.length === 0) return false
  // PR if more weight at same/more reps, or more reps at same weight
  let maxAtWeight = 0
  let maxWeight = 0
  for (const entry of history) {
    for (const set of entry.sets) {
      if (set.weight === weight && set.reps > maxAtWeight) maxAtWeight = set.reps
      if (set.weight > maxWeight) maxWeight = set.weight
    }
  }
  if (weight > maxWeight) return true
  if (weight === maxWeight && reps > maxAtWeight) return true
  return false
}

// Estimated 1RM using Epley formula
export function calculate1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

// Weekly stats
export function getWeekWorkouts() {
  const history = getWorkoutHistory()
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  return history.filter((w) => new Date(w.date) >= startOfWeek)
}

export function getStreak() {
  const history = getWorkoutHistory()
  if (history.length === 0) return 0

  const dates = [...new Set(history.map((w) => w.date.split('T')[0]))].sort().reverse()
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    const expectedStr = expected.toISOString().split('T')[0]
    if (dates[i] === expectedStr) {
      streak++
    } else if (i === 0) {
      // Allow today to not have a workout yet, check from yesterday
      expected.setDate(expected.getDate() - 1)
      const yesterdayStr = expected.toISOString().split('T')[0]
      if (dates[i] === yesterdayStr) {
        streak++
      } else {
        break
      }
    } else {
      break
    }
  }
  return streak
}
