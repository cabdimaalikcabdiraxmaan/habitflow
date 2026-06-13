import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import HabitListView from './components/dashboard/HabitListView'
import HabitDetailsView from './components/dashboard/HabitDetailsView'
import CalendarView from './components/dashboard/CalendarView'
import StatisticsView from './components/dashboard/StatisticsView'
import ManageHabits from './components/dashboard/ManageHabits'
import AccountSettingsView from './components/dashboard/AccountSettingsView'
import ServerWakeBanner from './components/ServerWakeBanner'
import './App.css'

function App() {
  return (
    <>
      <ServerWakeBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<HabitListView />} />
            <Route path="habits/:id" element={<HabitDetailsView />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="statistics" element={<StatisticsView />} />
            <Route path="manage-habits" element={<ManageHabits />} />
            <Route path="account" element={<AccountSettingsView />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
