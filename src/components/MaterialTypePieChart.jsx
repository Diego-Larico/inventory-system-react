import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function MaterialTypePieChart({ materiales }) {
  // Agrupa por tipo y suma cantidades
  const tipoMap = {};
  materiales.forEach(m => {
    tipoMap[m.tipo] = (tipoMap[m.tipo] || 0) + m.cantidad;
  });
  const data = Object.entries(tipoMap).map(([tipo, value]) => ({ name: tipo, value }));

  const COLORS = ['#8f5cff', '#6e7ff3', '#b6aaff', '#a18fff', '#f59e42', '#f87171'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-2 text-[#8f5cff]">Distribución por categoría</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MaterialTypePieChart;
