import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { FaPlus, FaEdit, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardBarChart from './components/DashboardBarChart';
// import AchievementBadgeWidget from './components/AchievementBadgeWidget';

function MaterialesView({ onNavigate }) {
  // Ejemplo de datos
  const materiales = [
    { nombre: 'Hilo blanco', tipo: 'Hilo', cantidad: 30, estado: 'Disponible' },
    { nombre: 'Tela azul', tipo: 'Tela', cantidad: 5, estado: 'Bajo stock' },
    { nombre: 'Botón dorado', tipo: 'Accesorio', cantidad: 50, estado: 'Disponible' },
    { nombre: 'Cremallera', tipo: 'Accesorio', cantidad: 2, estado: 'Bajo stock' },
  ];
  const movimientos = [
    '+10 Tela azul agregada (19/11/2025)',
    '-5 Hilo blanco usado en pedido #1023 (18/11/2025)',
    '+20 Botón dorado recibido (17/11/2025)',
    '-1 Cremallera usada en pedido #1022 (16/11/2025)',
  ];

  // Toast de bajo stock
  useEffect(() => {
    if (materiales.some(m => m.estado === 'Bajo stock')) {
      toast.warn('¡Atención! Hay materiales con bajo stock.', {
        position: 'top-right',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }
  }, []);

  return (
    <div className="flex fixed inset-0 bg-gray-100 animate-fade-in">
      <Sidebar onNavigate={onNavigate} activeView={'materiales'} />
      <ToastContainer />
      <div className="flex-1 flex flex-col min-h-0">
        <header className="px-8 py-6 bg-white border-b border-[#8f5cff] flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#8f5cff]">Materiales</h1>
          <button className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition flex items-center gap-2">
            <FaPlus /> Nuevo Material
          </button>
        </header>
        <main className="flex-1 p-8 overflow-y-auto animate-fade-in">

          {/* Resumen rápido + Indicadores circulares */}
          <section className="mb-8 flex gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg flex-1 flex flex-col items-center">
              <span className="text-lg font-semibold text-[#8f5cff]">Total materiales</span>
              <span className="text-4xl font-bold text-gray-700">{materiales.reduce((acc, m) => acc + m.cantidad, 0)}</span>

            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg flex-1 flex flex-col items-center">
              <span className="text-lg font-semibold text-[#8f5cff]">Tipos</span>
              <span className="text-4xl font-bold text-gray-700">{[...new Set(materiales.map(m => m.tipo))].length}</span>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg flex-1 flex flex-col items-center">
              <span className="text-lg font-semibold text-[#8f5cff] flex items-center gap-2">Bajo stock <FaExclamationTriangle className="text-yellow-400" /></span>
              <span className="text-4xl font-bold text-red-500">{materiales.filter(m => m.estado === 'Bajo stock').length}</span>

            </div>
          </section>

          {/* Acciones de búsqueda */}
          <section className="mb-8 flex gap-4 items-center">
            <input
              type="text"
              placeholder="Buscar material..."
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f5cff] w-64"
            />
            <button className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
              <FaSearch /> Buscar
            </button>
          </section>
          {/* Tabla de materiales */}
          <section className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-[#8f5cff] mb-4">Lista de materiales</h2>
            <table className="w-full text-center">
              <thead>
                <tr>
                  <th className="pb-2 text-center">Nombre</th>
                  <th className="pb-2 text-center">Tipo</th>
                  <th className="pb-2 text-center">Cantidad</th>
                  <th className="pb-2 text-center">Indicador</th>
                  <th className="pb-2 text-center">Estado</th>
                  <th className="pb-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materiales.map((m, i) => (
                  <tr key={i} className="border-b last:border-b-0 text-center">
                    <td>{m.nombre}</td>
                    <td>{m.tipo}</td>
                    <td>{m.cantidad}</td>
                    <td>
                      <div className="w-12 h-12 flex items-center justify-center mx-auto">
                        <CircularProgressbar
                          value={m.cantidad}
                          maxValue={100}
                          text={`${m.cantidad}`}
                          styles={buildStyles({
                            pathColor: m.estado === 'Disponible' ? '#8f5cff' : '#f59e42',
                            textColor: m.estado === 'Disponible' ? '#8f5cff' : '#f59e42',
                            trailColor: '#e5e7eb',
                          })}
                        />
                      </div>
                    </td>
                    <td>
                      {m.estado === 'Disponible' ? (
                        <span className="text-green-500">Disponible</span>
                      ) : (
                        <span className="text-red-500">Bajo stock</span>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-center">
                        <button className="bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white px-3 py-1 rounded-lg font-semibold flex items-center gap-2 shadow hover:scale-105 transition-transform duration-200">
                          <FaEdit /> Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {/* Evaluación semanal debajo de la lista de materiales */}
          <section className="mt-8">
            <DashboardBarChart />
          </section>
          {/* Historial de movimientos */}
          <section className="mt-8 bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-[#8f5cff] mb-4">Historial de movimientos</h2>
            <ul className="text-gray-600 text-sm list-disc pl-6">
              {movimientos.map((mov, i) => (
                <li key={i}>{mov}</li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

export default MaterialesView;
