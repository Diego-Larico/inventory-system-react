import React from 'react';


function Topbar() {
  return (
    <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-[#8f5cff]">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar..."
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f5cff]"
        />
        {/* ...no WeatherWidget here... */}
      </div>
      <div className="flex items-center gap-6">
        <button className="bg-[#8f5cff] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6e7ff3] transition">+ Nuevo Pedido</button>
        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Usuario" className="w-10 h-10 rounded-full border-2 border-[#8f5cff]" />
        <span className="font-semibold text-gray-700">usuario@email.com</span>
      </div>
    </header>
  );
}

export default Topbar;
