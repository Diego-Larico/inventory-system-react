import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { name: 'Lun', Materiales: 20, Productos: 5 },
  { name: 'Mar', Materiales: 35, Productos: 8 },
  { name: 'Mié', Materiales: 50, Productos: 10 },
  { name: 'Jue', Materiales: 30, Productos: 7 },
  { name: 'Vie', Materiales: 60, Productos: 12 },
  { name: 'Sáb', Materiales: 40, Productos: 9 },
  { name: 'Dom', Materiales: 25, Productos: 6 },
];

function DashboardBarChart() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg flex flex-col items-center w-full h-full min-h-[320px]">
      <h3 className="text-lg font-semibold mb-2 text-[#8f5cff]">Evolución semanal</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={180}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Materiales" fill="#8f5cff" radius={[8,8,0,0]} />
            <Bar dataKey="Productos" fill="#6e7ff3" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DashboardBarChart;
