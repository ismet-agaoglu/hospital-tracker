import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ClinicSelect from './pages/ClinicSelect';
import PanelSelect from './pages/PanelSelect';
import ServicePanel from './pages/ServicePanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/clinics" element={<ClinicSelect />} />
        <Route path="/panels" element={<PanelSelect />} />
        <Route path="/service-panel" element={<ServicePanel />} />
        <Route path="/followup-panel" element={<div className="p-8">🏗️ Hasta Takip Paneli - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}

export default App;
