
import React from 'react';
import ProgressCircleWidget from './ProgressCircleWidget';
import WeatherWidget from './WeatherWidget';

function Sidebar({ onNavigate, activeView }) {
  return (
  <aside className="bg-white h-screen w-64 flex flex-col border-r border-gray-200 shadow-sm p-6">
      <div className="flex items-center mb-10">
        <img src="/vite.svg" alt="Logo" className="w-10 h-10 mr-2" />
        <span className="font-bold text-lg text-[#8f5cff]">Inventario</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-4">
            <li
              className={`font-semibold flex items-center gap-2 cursor-pointer ${activeView === 'dashboard' ? 'text-[#8f5cff]' : 'text-gray-500 hover:text-[#8f5cff]'}`}
              onClick={() => onNavigate('dashboard')}
            >
              <span>Inicio</span>
            </li>
          <li
            className={`flex items-center gap-2 cursor-pointer ${activeView === 'materiales' ? 'text-[#8f5cff] font-semibold' : 'text-gray-500 hover:text-[#8f5cff]'}`}
            onClick={() => onNavigate('materiales')}
          >
            Materiales
          </li>
            <li
              className={`flex items-center gap-2 cursor-pointer ${activeView === 'productos' ? 'text-[#8f5cff] font-semibold' : 'text-gray-500 hover:text-[#8f5cff]'}`}
              onClick={() => onNavigate('productos')}
            >
              Productos
            </li>
          <li
            className={`flex items-center gap-2 cursor-pointer ${activeView === 'pedidos' ? 'text-[#8f5cff] font-semibold' : 'text-gray-500 hover:text-[#8f5cff]'}`}
            onClick={() => onNavigate('pedidos')}
          >
            Pedidos
          </li>
          <li
            className={`flex items-center gap-2 cursor-pointer ${activeView === 'reportes' ? 'text-[#8f5cff] font-semibold' : 'text-gray-500 hover:text-[#8f5cff]'}`}
            onClick={() => onNavigate('reportes')}
          >
            Reportes
          </li>
        </ul>
        <div className="mt-10">
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="hover:text-[#8f5cff] cursor-pointer">Configuración</li>
            <li className="hover:text-[#8f5cff] cursor-pointer">Ayuda</li>
            <li className="hover:text-[#8f5cff] cursor-pointer">Cerrar sesión</li>
          </ul>
        </div>
      </nav>
      <div className="mt-auto pt-4 flex flex-col gap-2">
        <ProgressCircleWidget value={75} text="Progreso mensual" />
        <div className="min-h-[120px] flex items-center justify-center">
          <WeatherWidget />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
