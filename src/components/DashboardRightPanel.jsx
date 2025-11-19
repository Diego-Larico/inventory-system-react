import React from 'react';
import CalendarWidget from './CalendarWidget';
import ProgressCircleWidget from './ProgressCircleWidget';
import AchievementBadgeWidget from './AchievementBadgeWidget';
import WeatherWidget from './WeatherWidget';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DashboardRightPanel() {
  // Muestra un toast visual cuando hay stock bajo
  React.useEffect(() => {
      toast.warn('¡Alerta! Hilo azul pronto a agotarse', {
        style: { backgroundColor: '#facc15', color: '#78350f' }, // yellow-400, text-yellow-900
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        icon: '⚠️',
        theme: 'colored',
      });
      toast.error('¡Alerta crítica! Tela blanca sin stock', {
        style: { backgroundColor: '#ef4444', color: '#fff' }, // red-500, text-white
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        icon: '🛑',
        theme: 'colored',
      });
  }, []);
  return (
    <aside className="hidden xl:flex flex-col w-80 p-6 gap-1 bg-transparent">
        <ToastContainer />
      {/* Recordatorio reemplaza Alertas de inventario */}
      <section className="bg-white rounded-2xl shadow-lg p-6 mb-4 flex flex-col justify-between" style={{ minHeight: '140px' }}>
        <div className="font-semibold text-gray-700 mb-2">Recordatorio</div>
        <div className="h-24 flex flex-col items-center justify-center">
            <span className="text-[#8f5cff] font-bold text-lg mb-2">Revisar stock mínimo</span>
          <button className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition">Ver materiales</button>
        </div>
      </section>
      {/* Pedidos urgentes */}
      <section className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        <span className="font-semibold text-gray-700 text-lg mb-2 block">Pedidos urgentes</span>
        <ul className="space-y-3">
          <li className="flex flex-col gap-1 items-center">
              <span className="font-medium text-[#8f5cff]">Pedido #1023</span>
            <span className="text-xs text-gray-400">Entrega: Mañana</span>
              <button className="bg-[#8f5cff] text-white px-2 py-1 rounded text-xs">Ver detalles</button>
          </li>
        </ul>
      </section>
      {/* Tareas rápidas */}
      <section className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        <span className="font-semibold text-gray-700 text-lg mb-2 block">Tareas rápidas</span>
        <div className="flex flex-col gap-2">
            <button className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition">Agregar material</button>
            <button className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition">Registrar pedido</button>
        </div>
      </section>
      {/* Notas rápidas */}
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <span className="font-semibold text-gray-700 text-lg mb-2 block">Notas rápidas</span>
        <textarea className="w-full h-20 p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-400 mb-2" placeholder="Escribe un recordatorio o tarea..." />
          <button className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition w-full">Guardar nota</button>
      </section>
    </aside>
  );
}

export default DashboardRightPanel;
