import React from 'react';

function DashboardCards() {
  return (
    <section className="flex flex-col md:flex-row gap-6 mb-8 w-full">
      <div className="flex-1 min-w-[180px] bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between">
        <div className="text-lg font-semibold mb-2">Materiales en stock</div>
        <div className="text-4xl font-bold">120</div>
        <div className="text-xs mt-2">Actualizado hoy</div>
      </div>
      <div className="flex-1 min-w-[180px] bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between border border-gray-100">
        <div className="text-lg font-semibold mb-2 text-[#8f5cff]">Productos</div>
        <div className="text-4xl font-bold text-gray-700">35</div>
        <div className="text-xs mt-2 text-gray-400">En catálogo</div>
      </div>
      <div className="flex-1 min-w-[180px] bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between border border-gray-100">
        <div className="text-lg font-semibold mb-2 text-[#8f5cff]">Pedidos activos</div>
        <div className="text-4xl font-bold text-gray-700">8</div>
        <div className="text-xs mt-2 text-gray-400">Pendientes</div>
      </div>
      <div className="flex-1 min-w-[180px] bg-white rounded-2xl p-6 shadow-lg flex flex-col justify-between border border-gray-100">
        <div className="text-lg font-semibold mb-2 text-[#8f5cff]">Usuarios</div>
        <div className="text-4xl font-bold text-gray-700">4</div>
        <div className="text-xs mt-2 text-gray-400">Registrados</div>
      </div>
    </section>
  );
}

export default DashboardCards;
