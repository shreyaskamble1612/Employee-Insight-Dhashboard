import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext'
import { EmployeeProvider } from './Context/EmployeeContext'
import ProtectedRoute from './routes'
import Login from './Pages/Login'
import List from './Pages/List'
import Details from './Pages/Details'
import Analytics from './Pages/Analytics'

const App = () => {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/list"
              element={
                <ProtectedRoute>
                  <List />
                </ProtectedRoute>
              }
            />
            <Route
              path="/details/:employeeId"
              element={
                <ProtectedRoute>
                  <Details />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/list" replace />} />
            <Route path="*" element={<Navigate to="/list" replace />} />
          </Routes>
        </BrowserRouter>
      </EmployeeProvider>
    </AuthProvider>
  )
}

export default App
