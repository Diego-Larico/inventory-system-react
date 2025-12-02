
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardMain from './components/DashboardMain';
import DashboardRightPanel from './components/DashboardRightPanel';
import Login from './Login';
import MaterialesView from './MaterialesView';
import ProductosView from './ProductosView';
import PedidosView from './PedidosView';
import ReportesView from './ReportesView';

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
    
    // Renderiza el Topbar solo en Dashboard (no en vistas específicas)
    const showTopbar = activeView === 'dashboard';
    
    // Renderiza el RightPanel solo en Dashboard
    const showRightPanel = activeView === 'dashboard';

    return (
      <div className="flex fixed inset-0 bg-gray-100 dark:bg-gray-900">
        <Sidebar onNavigate={handleSidebarNav} activeView={activeView} />
        <div className="flex-1 flex flex-col min-h-0">
          {showTopbar && <Topbar />}
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50 dark:bg-gray-800">
              <Routes>
                <Route path="/" element={<DashboardMain />} />
                <Route path="/materiales" element={<MaterialesView onNavigate={handleSidebarNav} />} />
                <Route path="/productos" element={<ProductosView onNavigate={handleSidebarNav} />} />
                <Route path="/pedidos" element={<PedidosView onNavigate={handleSidebarNav} />} />
                <Route path="/reportes" element={<ReportesView onNavigate={handleSidebarNav} />} />
                {/* Puedes agregar más rutas aquí */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            {showRightPanel && <DashboardRightPanel />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          limit={5}
        />
        {isLoggedIn ? <MainLayout /> : <Login onLoginSuccess={() => setIsLoggedIn(true)} />}
      </Router>
    </ThemeProvider>
  );
}

export default App;
