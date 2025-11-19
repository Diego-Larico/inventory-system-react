import { useState } from 'react';
import Login from './Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardMain from './components/DashboardMain';
import DashboardRightPanel from './components/DashboardRightPanel';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return isLoggedIn ? (
    <div className="flex fixed inset-0 bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Topbar />
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            <DashboardMain />
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
