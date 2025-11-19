import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Ene', Pedidos: 4 },
  { name: 'Feb', Pedidos: 7 },
  { name: 'Mar', Pedidos: 5 },
  { name: 'Abr', Pedidos: 9 },
  { name: 'May', Pedidos: 6 },
  { name: 'Jun', Pedidos: 8 },
];

function DashboardLineChart() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg flex flex-col items-center w-full max-w-2xl mx-auto h-full min-h-[320px]">
      <h3 className="text-lg font-semibold mb-2 text-[#8f5cff]">Pedidos por mes</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={180}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="Pedidos" stroke="#8f5cff" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DashboardLineChart;
