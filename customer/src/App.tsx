import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './pages/Menu';
import OrderHistory from './pages/OrderHistory';
import ThankYou from './pages/ThankYou';
import Invoice from './pages/Invoice';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/menu" element={<Menu />} />
      <Route path="/orders"  element={<OrderHistory />} />
      <Route path="/thankyou" element={<ThankYou />} />
      <Route path="/invoice/:billId" element={<Invoice />} />
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
