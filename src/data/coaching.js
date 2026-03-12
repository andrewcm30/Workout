/**
 * Expert coaching logic for weight recommendations
 * Based on progressive overload principles
 */

// Muscle group color mapping for UI
export const muscleGroupColors = {
  chest: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  back: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  shoulders: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  quads: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  hamstrings: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  biceps: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  triceps: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' },
  core: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  calves: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  rear_delts: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
}

export const muscleGroupLabels = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  biceps: 'Biceps',
  triceps: 'Triceps',
  core: 'Core',
  calves: 'Calves',
  rear_delts: 'Rear Delts',
}

function parseRepRange(repRange) {
  const cleaned = repRange.replace(/\s*each\s*/i, '')
  if (cleaned.includes('-')) {
    const [min, max] = cleaned.split('-').map(Number)
    return { min, max }
  }
  const num = parseInt(cleaned)
  return { min: num, max: num }
}

function getWeightIncrement(exercise) {
  const name = exercise.name.toLowerCase()
  const group = exercise.muscleGroup

  // Heavy barbell compounds get 5 lb jumps
  if (name.includes('deadlift') || name.includes('squat') || name.includes('bench press') ||
      name.includes('romanian') || name.includes('hack squat') || name.includes('leg press')) {
    return 5
  }

  // Smith machine compounds
  if (name.includes('smith')) return 5

  // Rows and pulldowns
  if (name.includes('row') || name.includes('pulldown') || name.includes('pull up')) return 5

  // Dumbbell exercises - typically go up in 5 lb increments (per hand)
  if (name.includes('dumbbell') || name.includes('db')) return 5

  // Cable/machine isolation
  if (name.includes('cable') || name.includes('pec deck') || name.includes('curl') ||
      name.includes('extension') || name.includes('raise') || name.includes('face pull') ||
      name.includes('leg curl')) {
    return 5
  }

  // Small isolation default
  if (['biceps', 'triceps', 'rear_delts', 'calves'].includes(group)) return 5

  return 5
}

/**
 * Get coaching recommendation for an exercise based on completed sets
 * @param {Object} exercise - Exercise template data
 * @param {Array} completedSets - Array of { weight, reps, completed } objects
 * @returns {Object|null} - { type: 'increase'|'maintain'|'stay', message, nextWeight }
 */
export function getCoachingTip(exercise, completedSets) {
  if (exercise.repType === 'duration') return null

  const finished = completedSets.filter(s => s.completed)
  if (finished.length === 0) return null

  const { min, max } = parseRepRange(exercise.repRange)
  const increment = getWeightIncrement(exercise)

  // Look at the last completed set
  const lastSet = finished[finished.length - 1]
  const weight = parseFloat(lastSet.weight) || 0
  const reps = parseInt(lastSet.reps) || 0

  if (weight <= 0 || reps <= 0) return null

  // Count how many sets hit top of range or above
  const setsAtTop = finished.filter(s => {
    const r = parseInt(s.reps) || 0
    return r >= max
  }).length

  // All sets hit top of rep range → time to increase
  if (setsAtTop === finished.length && finished.length >= 2) {
    return {
      type: 'increase',
      message: `You crushed all ${max} reps. Go up to ${weight + increment} lbs next session.`,
      nextWeight: weight + increment,
    }
  }

  // Most sets hit top of range
  if (setsAtTop >= Math.ceil(finished.length / 2) && finished.length >= 2) {
    return {
      type: 'increase',
      message: `Strong. Try ${weight + increment} lbs next time — aim for ${min} reps.`,
      nextWeight: weight + increment,
    }
  }

  // Sets are in the target range
  const setsInRange = finished.filter(s => {
    const r = parseInt(s.reps) || 0
    return r >= min && r <= max
  }).length

  if (setsInRange >= Math.ceil(finished.length / 2)) {
    return {
      type: 'maintain',
      message: `Right in the zone. Keep ${weight} lbs and push for ${max} reps.`,
      nextWeight: weight,
    }
  }

  // Below range — stay at current weight
  const setsBelow = finished.filter(s => {
    const r = parseInt(s.reps) || 0
    return r < min
  }).length

  if (setsBelow > 0) {
    return {
      type: 'stay',
      message: `Stay at ${weight} lbs until you hit ${min}+ reps on every set.`,
      nextWeight: weight,
    }
  }

  return null
}

/**
 * Get a quick weight suggestion when user fills in weight
 * Shows what they should aim for based on last session
 */
export function getWeightSuggestion(exercise, lastSets) {
  if (!lastSets || lastSets.length === 0 || exercise.repType === 'duration') return null

  const { max } = parseRepRange(exercise.repRange)
  const increment = getWeightIncrement(exercise)

  // Check if last session they hit top of range on most sets
  const topCount = lastSets.filter(s => s.reps >= max).length
  if (topCount >= Math.ceil(lastSets.length / 2)) {
    const lastWeight = lastSets[0].weight
    return {
      suggested: lastWeight + increment,
      reason: `Hit ${max}+ reps last time`,
    }
  }

  return null
}
