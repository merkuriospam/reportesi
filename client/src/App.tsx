import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ReportForm from './components/ReportForm';
import PeopleAdmin from './components/PeopleAdmin';
import ReportList from './components/ReportList';
import Dashboard from './components/Dashboard';
import PersonDetail from './components/PersonDetail';
import MapReport from './components/MapReport';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 transition-colors">
        {token && (
          <>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
            <header className="bg-white border-b border-gray-100 flex items-center justify-between px-4 shadow-sm h-[60px]">
              <div className="h-10 w-auto">
                {/* <img src="/logo.png" alt="Logo" className="h-full object-contain" /> */}
                <span className="ml-2 text-xl font-bold text-gray-800">Recorridas Nocturnas</span>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-600 hover:text-blue-600 hover:scale-105 transition-all"
              >
                <Menu size={22} />
              </button>
            </header>
          </>
        )}

        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route 
              path="/login" 
              element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/register" 
              element={!token ? <Register /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/" 
              element={token ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/report" 
              element={token ? <ReportForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/history" 
              element={token ? <ReportList /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/map" 
              element={token ? <MapReport /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/people" 
              element={token ? <PeopleAdmin /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/person/:id" 
              element={token ? <PersonDetail /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
