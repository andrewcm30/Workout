import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import ActiveWorkout from './screens/ActiveWorkout'
import HistoryScreen from './screens/HistoryScreen'
import ProgressScreen from './screens/ProgressScreen'
import BodyStatsScreen from './screens/BodyStatsScreen'
import WorkoutDetail from './screens/WorkoutDetail'

function App() {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/workout/:templateId" element={<ActiveWorkout />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/history/:workoutId" element={<WorkoutDetail />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/body" element={<BodyStatsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

export default App
