import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Deliveries from './pages/Deliveries';
import OrderHistory from './pages/OrderHistory';
import Tables from './pages/Tables';
import Profile from './pages/Profile';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/orders"  element={<Orders />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/tables"  element={<Tables />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;