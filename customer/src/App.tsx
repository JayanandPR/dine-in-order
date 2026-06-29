import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RestaurantList from './pages/RestaurantList';
import Home from './pages/Home';
import Menu from './pages/Menu';
import OrderHistory from './pages/OrderHistory';
import ThankYou from './pages/ThankYou';
import Invoice from './pages/Invoice';
import DeliveryTracking from './pages/DeliveryTracking';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"                element={<RestaurantList />} />
      <Route path="/home"            element={<Home />} />
      <Route path="/menu"            element={<Menu />} />
      <Route path="/orders"          element={<OrderHistory />} />
      <Route path="/thankyou"        element={<ThankYou />} />
      <Route path="/invoice/:billId" element={<Invoice />} />
      <Route path="/track/:orderId"  element={<DeliveryTracking />} />
    </Routes>
  </BrowserRouter>
);

export default App;
