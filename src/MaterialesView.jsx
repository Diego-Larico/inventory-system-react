import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { FaPlus, FaEdit, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Select from 'react-select';
import MaterialTypePieChart from './components/MaterialTypePieChart';
import DashboardBarChart from './components/DashboardBarChart';
import * as XLSX from 'xlsx';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import AchievementBadgeWidget from './components/AchievementBadgeWidget';
import NuevoMaterialModal from './components/NuevoMaterialModal';
import EditarMaterialModal from './components/EditarMaterialModal';

function MaterialesView({ onNavigate }) {
  const [showNuevoMaterialModal, setShowNuevoMaterialModal] = useState(false);
  const [showEditarMaterialModal, setShowEditarMaterialModal] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
  // Ejemplo de datos
  const materiales = [
    { nombre: 'Hilo blanco', tipo: 'Hilo', cantidad: 30, estado: 'Disponible' },
    { nombre: 'Tela azul', tipo: 'Tela', cantidad: 5, estado: 'Bajo stock' },
    { nombre: 'Botón dorado', tipo: 'Accesorio', cantidad: 50, estado: 'Disponible' },
    { nombre: 'Cremallera', tipo: 'Accesorio', cantidad: 2, estado: 'Bajo stock' },
  ];

  // Filtros
  const tipoOptions = [...new Set(materiales.map(m => m.tipo))].map(tipo => ({ value: tipo, label: tipo }));
  const estadoOptions = [...new Set(materiales.map(m => m.estado))].map(estado => ({ value: estado, label: estado }));
  const [tipoFiltro, setTipoFiltro] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Filtrado inteligente
  const materialesFiltrados = materiales.filter(m => {
    const matchTipo = tipoFiltro ? m.tipo === tipoFiltro.value : true;
    const matchEstado = estadoFiltro ? m.estado === estadoFiltro.value : true;
    const matchBusqueda = busqueda ? m.nombre.toLowerCase().includes(busqueda.toLowerCase()) : true;
    return matchTipo && matchEstado && matchBusqueda;
  });

  // Exportar a Excel
  function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(materialesFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Materiales');
    XLSX.writeFile(wb, 'materiales-inventario.xlsx');
  }

  // Materiales críticos (menor stock)
  const materialesCriticos = materiales
    .filter(m => m.estado === 'Bajo stock')
    .sort((a, b) => a.cantidad - b.cantidad)
    .slice(0, 3);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const movimientos = [
    { tipo: 'entrada', descripcion: '+10 Tela azul agregada', fecha: '19/11/2025' },
    { tipo: 'salida', descripcion: '-5 Hilo blanco usado en pedido #1023', fecha: '18/11/2025' },
    { tipo: 'entrada', descripcion: '+20 Botón dorado recibido', fecha: '17/11/2025' },
    { tipo: 'salida', descripcion: '-1 Cremallera usada en pedido #1022', fecha: '16/11/2025' },
  ];

  const handleNuevoMaterial = (data) => {
    console.log('Nuevo material creado:', data);
    // Aquí puedes agregar la lógica para guardar el material
  };

  return (
    <div className="flex fixed inset-0 bg-gray-100">
      <Sidebar onNavigate={onNavigate} activeView={'materiales'} />
      <div className="flex-1 flex flex-col min-h-0">
        <header className="px-8 py-6 bg-white border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#8f5cff]">Materiales</h1>
          <button 
            onClick={() => setShowNuevoMaterialModal(true)}
            className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition flex items-center gap-2"
          >
            <FaPlus /> Nuevo Material
          </button>
        </header>
        <main className="flex-1 p-8 overflow-y-auto animate-fade-in">

          {/* Resumen rápido + Indicadores circulares + Materiales críticos */}
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
            {/* Indicador de materiales críticos */}
            <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-start min-w-[220px]">
              <span className="text-lg font-semibold text-red-500 mb-2">Materiales críticos</span>
              {materialesCriticos.length === 0 ? (
                <span className="text-gray-400 text-sm">Sin materiales críticos</span>
              ) : (
                <ul className="w-full">
                  {materialesCriticos.map((m, i) => (
                    <li key={i} className="flex justify-between items-center py-1 text-sm">
                      <span className="font-medium text-[#8f5cff]">{m.nombre}</span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg font-bold">{m.cantidad}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Filtro avanzado y búsqueda inteligente + exportar */}
          <section className="mb-8 flex flex-wrap gap-4 items-center">
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar material..."
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f5cff] w-64"
            />
            <Select
              options={tipoOptions}
              value={tipoFiltro}
              onChange={setTipoFiltro}
              isClearable
              placeholder="Filtrar por tipo"
              className="min-w-[180px] w-48"
            />
            <Select
              options={estadoOptions}
              value={estadoFiltro}
              onChange={setEstadoFiltro}
              isClearable
              placeholder="Filtrar por estado"
              className="min-w-[180px] w-48"
            />
            <button className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2" onClick={exportarExcel}>
              Exportar a Excel
            </button>
          </section>
          {/* Sección principal: materiales y movimientos lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 w-full items-start">
            {/* Columna principal: Tabla de materiales y gráfico de distribución */}
            <div className="flex flex-col gap-6 w-full max-w-full">
              <section className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in w-full max-w-full">
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
                    {materialesFiltrados.map((m, i) => (
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
                            <button 
                              onClick={() => {
                                setMaterialSeleccionado(m);
                                setShowEditarMaterialModal(true);
                              }}
                              className="bg-gradient-to-br from-[#f59e42] to-[#ff7a42] text-white px-3 py-1 rounded-lg font-semibold flex items-center gap-2 shadow hover:scale-105 transition-transform duration-200"
                            >
                              <FaEdit /> Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              {/* Gráfico de distribución por tipo de material debajo de la tabla */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 w-full mt-6">
                <MaterialTypePieChart materiales={materialesFiltrados} />
                <DashboardBarChart />
              </div>
            </div>
            {/* Historial de movimientos - Línea de tiempo visual */}
            <section className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in min-w-[320px] max-w-[420px] w-full">
              <h2 className="text-xl font-semibold text-[#8f5cff] mb-4">Historial de movimientos</h2>
              <VerticalTimeline layout="1-column">
                {(mostrarTodos ? movimientos : movimientos.slice(0, 3)).map((mov, i) => (
                  <VerticalTimelineElement
                    key={i}
                    date={mov.fecha}
                    iconStyle={{ background: mov.tipo === 'entrada' ? '#8f5cff' : '#f59e42', color: '#fff' }}
                    icon={mov.tipo === 'entrada' ? <FaPlus /> : <FaEdit />}
                    contentStyle={{ background: '#f9f9ff', color: '#333', boxShadow: 'none', border: '1px solid #e5e7eb', padding: '12px 16px' }}
                    contentArrowStyle={{ borderRight: '7px solid #e5e7eb' }}
                  >
                    <h3 className="font-semibold text-[#8f5cff] text-base mb-1">{mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}</h3>
                    <p className="text-gray-700 text-sm">{mov.descripcion}</p>
                  </VerticalTimelineElement>
                ))}
              </VerticalTimeline>
              {movimientos.length > 3 && !mostrarTodos && (
                <button
                  className="mt-4 bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform duration-200 border border-[#8f5cff]"
                  onClick={() => setMostrarTodos(true)}
                >
                  Ver más movimientos
                </button>
              )}
            </section>
          </div>
        </main>
      </div>

      <NuevoMaterialModal
        isOpen={showNuevoMaterialModal}
        onClose={() => setShowNuevoMaterialModal(false)}
        onSubmit={handleNuevoMaterial}
      />

      <EditarMaterialModal
        isOpen={showEditarMaterialModal}
        onClose={() => {
          setShowEditarMaterialModal(false);
          setMaterialSeleccionado(null);
        }}
        onSubmit={(data) => {
          console.log('Material editado:', data);
          setShowEditarMaterialModal(false);
          setMaterialSeleccionado(null);
        }}
        material={materialSeleccionado}
      />
    </div>
  );
}

export default MaterialesView;
