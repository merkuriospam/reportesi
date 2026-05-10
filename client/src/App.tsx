import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
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

  const userData = useMemo(() => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }, [token]);

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
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
                <span className="text-xl font-black text-gray-800 tracking-tight">ReporteSI</span>
                {userData?.groupName && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg leading-none">
                    {userData.groupName}
                  </span>
                )}
              </Link>
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
