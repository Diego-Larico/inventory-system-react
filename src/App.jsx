
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardMain from './components/DashboardMain';
import DashboardRightPanel from './components/DashboardRightPanel';
import Login from './Login';
import MaterialesView from './MaterialesView';
import ProductosView from './ProductosView';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Wrapper para navegación con React Router
  function MainLayout() {
    const navigate = useNavigate();
    const handleSidebarNav = (view) => {
      navigate(view === 'dashboard' ? '/' : `/${view}`);
    };
    // Detecta la ruta actual para Sidebar
    const activeView = window.location.pathname === '/' ? 'dashboard' : window.location.pathname.replace('/', '');
    return (
      <div className="flex fixed inset-0 bg-gray-100">
        <Sidebar onNavigate={handleSidebarNav} activeView={activeView} />
        <div className="flex-1 flex flex-col min-h-0">
          <Topbar />
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0">
              <Routes>
                <Route path="/" element={<DashboardMain />} />
                <Route path="/materiales" element={<MaterialesView onNavigate={handleSidebarNav} />} />
                <Route path="/productos" element={<ProductosView onNavigate={handleSidebarNav} />} />
                {/* Puedes agregar más rutas aquí */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            <DashboardRightPanel />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {isLoggedIn ? <MainLayout /> : <Login onLoginSuccess={() => setIsLoggedIn(true)} />}
    </Router>
  );
}

export default App;
