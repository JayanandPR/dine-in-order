import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Restaurant from './pages/Restaurant';
import Menu from './pages/Menu';
import Tables from './pages/Tables';
import Staff from './pages/Staff';
import Orders from './pages/Orders';
import Bills from './pages/Bills';
import Analytics from './pages/Analytics';
import Ratings from './pages/Ratings';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/menu"       element={<Menu />} />
          <Route path="/tables"     element={<Tables />} />
          <Route path="/staff"      element={<Staff />} />
          <Route path="/orders"     element={<Orders />} />
          <Route path="/bills"      element={<Bills />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ratings"   element={<Ratings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
