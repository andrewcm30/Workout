export const workoutTemplates = [
  {
    id: 'day1a',
    name: 'Day 1 (A) — Upper A',
    category: 'upper',
    targetTime: '40-45 min',
    totalSets: 23,
    blocks: [
      {
        blockNumber: 1,
        type: 'straight',
        restSeconds: 150,
        exercises: [
          {
            id: 'incline_bench_smith',
            name: 'Incline Bench Press (Smith)',
            muscleGroup: 'chest',
            sets: 4,
            repRange: '6-8',
            repType: 'reps',
          },
        ],
      },
      {
        blockNumber: 2,
        type: 'superset',
        label: 'Superset A',
        restSeconds: 75,
        exercises: [
          {
            id: 'pull_up',
            name: 'Pull Up',
            muscleGroup: 'back',
            sets: 3,
            repRange: '6-10',
            repType: 'reps',
          },
          {
            id: 'lateral_raise_db',
            name: 'Lateral Raise (Dumbbell)',
            muscleGroup: 'shoulders',
            sets: 4,
            repRange: '12-15',
            repType: 'reps',
          },
        ],
      },
      {
        blockNumber: 3,
        type: 'superset',
        label: 'Superset B',
        restSeconds: 75,
        exercises: [
          {
            id: 'chest_supported_row',
            name: 'Chest Supported Row',
            muscleGroup: 'back',
            sets: 3,
            repRange: '8-10',
            repType: 'reps',
          },
          {
            id: 'face_pull_cable_a',
            name: 'Face Pull (Cable)',
            muscleGroup: 'rear_delts',
            sets: 3,
            repRange: '15-20',
            repType: 'reps',
          },
        ],
      },
      {
        blockNumber: 4,
        type: 'superset',
        label: 'Superset C',
        restSeconds: 60,
        exercises: [
          {
            id: 'triceps_extension',
            name: 'Triceps Extension',
            muscleGroup: 'triceps',
            sets: 3,
            repRange: '10-12',
            repType: 'reps',
          },
          {
            id: 'hammer_curl_db',
            name: 'Hammer Curl (Dumbbell)',
            muscleGroup: 'biceps',
            sets: 3,
            repRange: '10-12',
            repType: 'reps',
          },
        ],
      },
    ],
  },
  {
    id: 'day2b',
    name: 'Day 2 (B) — Lower A',
    category: 'lower',
    targetTime: '35-40 min',
    totalSets: 16,
    blocks: [
      {
        blockNumber: 1,
        type: 'straight',
        restSeconds: 150,
        exercises: [
          {
            id: 'romanian_deadlift_bb',
            name: 'Romanian Deadlift (Barbell)',
            muscleGroup: 'hamstrings',
            sets: 4,
            repRange: '6-8',
            repType: 'reps',
          },
        ],
      },
      {
        blockNumber: 2,
        type: 'superset',
        label: 'Superset A',
        restSeconds: 90,
        exercises: [
          {
            id: 'leg_press',
            name: 'Leg Press',
            muscleGroup: 'quads',
            sets: 3,
            repRange: '10-12',
            repType: 'reps',
          },
          {
            id: 'plank',
            name: 'Plank',
            muscleGroup: 'core',
            sets: 3,
            repRange: '45-60',
            repType: 'duration',
          },
        ],
      },
      {
        blockNumber: 3,
        type: 'superset',
        label: 'Superset B',
        restSeconds: 75,
        exercises: [
          {
            id: 'reverse_lunge_db',
            name: 'Reverse Lunge (Dumbbell)',
            muscleGroup: 'quads',
            sets: 3,
            repRange: '10-12 each',
            repType: 'reps',
            perSide: true,
          },
          {
            id: 'standing_calf_raise_a',
            name: 'Standing Calf Raise',
            muscleGroup: 'calves',
            sets: 3,
            repRange: '12-15',
            repType: 'reps',
          },
        ],
      },
    ],
  },
  {
    id: 'day3b',
    name: 'Day 3 (B) — Upper B',
    category: 'upper',
    targetTime: '40-45 min',
    totalSets: 22,
    blocks: [
      {
        blockNumber: 1,
        type: 'straight',
        restSeconds: 150,
        exercises: [
          {
            id: 'bench_press_smith',
            name: 'Bench Press (Smith)',
            muscleGroup: 'chest',
            sets: 3,
            repRange: '6-8',
            repType: 'reps',
          },
        ],
      },
      {
        blockNumber: 2,
        type: 'superset',
        label: 'Superset A',
        restSeconds: 75,
        exercises: [
          {
            id: 'lat_pulldown_wide',
            name: 'Lat Pulldown (Wide Grip)',
            muscleGroup: 'back',
            sets: 3,
            repRange: '8-10',
            repType: 'reps',
          },
          {
            id: 'cable_lateral_raise',
            name: 'Cable Lateral Raise',
            muscleGroup: 'shoulders',
            sets: 4,
            repRange: '12-15',
            repType: 'reps',
          },
        ],
      },
      {
        blockNumber: 3,
        type: 'superset',
        label: 'Superset B',
        restSeconds: 75,
        exercises: [
          {
            id: 'pec_deck',
            name: 'Pec Deck',
            muscleGroup: 'chest',
            sets: 3,
            repRange: '10-12',
            repType: 'reps',
          },
          {
            id: 'face_pull_cable_b',
            name: 'Face Pull (Cable)',
            muscleGroup: 'rear_delts',
            sets: 3,
            repRange: '15-20',
            repType: 'reps',
          },
        ],
      },
      {
        blockNumber: 4,
        type: 'superset',
        label: 'Superset C',
        restSeconds: 60,
        exercises: [
          {
            id: 'overhead_triceps_ext_db',
            name: 'Overhead Triceps Extension (Dumbbell)',
            muscleGroup: 'triceps',
            sets: 3,
            repRange: '10-12',
            repType: 'reps',
          },
          {
            id: 'preacher_curl_bb',
            name: 'Preacher Curl (Barbell)',
            muscleGroup: 'biceps',
            sets: 3,
            repRange: '10-12',
            repType: 'reps',
          },
        ],
      },
    ],
  },
  {
    id: 'day4a',
    name: 'Day 4 (A) — Lower B',
    category: 'lower',
    targetTime: '35-40 min',
    totalSets: 16,
    blocks: [
      {
        blockNumber: 1,
        type: 'straight',
        restSeconds: 180,
        exercises: [
          {
            id: 'deadlift_bb',
            name: 'Deadlift (Barbell)',
            muscleGroup: 'hamstrings',
            sets: 3,
            repRange: '5',
            repType: 'reps',
          },
        ],
      },
      {
        blockNumber: 2,
        type: 'superset',
        label: 'Superset A',
        restSeconds: 90,
        exercises: [
          {
            id: 'hack_squat',
            name: 'Hack Squat',
            muscleGroup: 'quads',
            sets: 4,
            repRange: '8-10',
            repType: 'reps',
          },
          {
            id: 'ab_wheel',
            name: 'Ab Wheel',
            muscleGroup: 'core',
            sets: 3,
            repRange: '10-12',
            repType: 'reps',
          },
        ],
      },
      {
        blockNumber: 3,
        type: 'superset',
        label: 'Superset B',
        restSeconds: 75,
        exercises: [
          {
            id: 'lying_leg_curl',
            name: 'Lying Leg Curl',
            muscleGroup: 'hamstrings',
            sets: 3,
            repRange: '10-12',
            repType: 'reps',
          },
          {
            id: 'standing_calf_raise_b',
            name: 'Standing Calf Raise',
            muscleGroup: 'calves',
            sets: 3,
            repRange: '12-15',
            repType: 'reps',
          },
        ],
      },
    ],
  },
]

export function getTemplate(id) {
  return workoutTemplates.find((t) => t.id === id)
}

export function getTotalSetsForTemplate(template) {
  let total = 0
  for (const block of template.blocks) {
    for (const exercise of block.exercises) {
      total += exercise.sets
    }
  }
  return total
}
