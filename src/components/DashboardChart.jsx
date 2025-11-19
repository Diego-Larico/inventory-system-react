import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Materiales', value: 120 },
  { name: 'Productos', value: 35 },
  { name: 'Pedidos', value: 8 },
  { name: 'Usuarios', value: 4 },
];

const COLORS = ['#8f5cff', '#6e7ff3', '#b6aaff', '#a18fff'];

function DashboardChart() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg flex flex-col items-center w-full max-w-2xl mx-auto h-full min-h-[320px]">
      <h3 className="text-lg font-semibold mb-2 text-[#8f5cff]">Distribución General</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={180}>
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

export default DashboardChart;
