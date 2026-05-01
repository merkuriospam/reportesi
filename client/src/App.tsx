import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ReportForm from './components/ReportForm';
import PeopleAdmin from './components/PeopleAdmin';
import ReportList from './components/ReportList';
import Dashboard from './components/Dashboard';
import PersonDetail from './components/PersonDetail';
import { LogOut, Users, ClipboardList, History, LayoutDashboard } from 'lucide-react';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

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
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-0 md:pt-20 transition-colors">
        {token && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 md:top-0 md:bottom-auto md:border-t-0 md:border-b flex justify-around items-center px-2 py-3 z-50 shadow-2xl shadow-black/5">
            <Link to="/" className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600 transition-colors group">
              <LayoutDashboard size={22} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Inicio</span>
            </Link>
            <Link to="/report" className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600 transition-colors group">
              <ClipboardList size={22} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Reportar</span>
            </Link>
            <Link to="/history" className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600 transition-colors group">
              <History size={22} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Historial</span>
            </Link>
            <Link to="/people" className="flex flex-col items-center p-2 text-gray-400 hover:text-blue-600 transition-colors group">
              <Users size={22} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Censo</span>
            </Link>
            <button onClick={handleLogout} className="flex flex-col items-center p-2 text-gray-400 hover:text-red-500 transition-colors group">
              <LogOut size={22} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Salir</span>
            </button>
          </nav>
        )}

        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route 
              path="/login" 
              element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!token ? <Register /> : <Navigate to="/" />} 
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
