import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { metric: 'Materiales', value: 120 },
  { metric: 'Productos', value: 35 },
  { metric: 'Pedidos', value: 8 },
  { metric: 'Usuarios', value: 4 },
];

function DashboardRadarChart() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg flex flex-col items-center w-full max-w-2xl mx-auto h-full min-h-[320px]">
      <h3 className="text-lg font-semibold mb-2 text-[#8f5cff]">Comparativa de métricas</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={180}>
          <RadarChart cx="50%" cy="50%" outerRadius={80} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={30} domain={[0, 120]} />
            <Radar name="Métricas" dataKey="value" stroke="#8f5cff" fill="#8f5cff" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DashboardRadarChart;
