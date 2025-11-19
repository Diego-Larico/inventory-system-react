
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardMain from './components/DashboardMain';
import DashboardRightPanel from './components/DashboardRightPanel';
import Login from './Login';
import MaterialesView from './MaterialesView';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const handleSidebarNav = (view) => {
    setActiveView(view);
  };

  return isLoggedIn ? (
    <div className="flex fixed inset-0 bg-gray-100">
      <Sidebar onNavigate={handleSidebarNav} activeView={activeView} />
      <div className="flex-1 flex flex-col min-h-0">
        <Topbar />
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            {activeView === 'dashboard' && <DashboardMain />}
            {activeView === 'materiales' && <MaterialesView onNavigate={handleSidebarNav} />}
            {/* Puedes agregar más vistas aquí */}
          </div>
          <DashboardRightPanel />
        </div>
      </div>
    </div>
  ) : (
    <Login onLoginSuccess={() => setIsLoggedIn(true)} />
  );
}

export default App;
