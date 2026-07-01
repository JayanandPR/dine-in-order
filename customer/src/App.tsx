import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/marketing/Landing';
import About from './pages/marketing/About';
import Pricing from './pages/marketing/Pricing';
import Contact from './pages/marketing/Contact';
import FAQ from './pages/marketing/FAQ';
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
      {/* Marketing site */}
      <Route path="/"          element={<Landing />} />
      <Route path="/about"     element={<About />} />
      <Route path="/pricing"   element={<Pricing />} />
      <Route path="/contact"   element={<Contact />} />
      <Route path="/faq"       element={<FAQ />} />

      {/* Restaurant listing */}
      <Route path="/restaurants" element={<RestaurantList />} />

      {/* Ordering flow — unchanged */}
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
