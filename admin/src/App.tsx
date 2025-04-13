import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import { API_BASE_URL } from './config';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminPanel />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App; 