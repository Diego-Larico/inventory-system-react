import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function ProgressCircleWidget({ value = 75, text = 'Pedidos' }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex flex-col items-center">
      <span className="font-semibold text-[#8f5cff] text-lg mb-2 block">Progreso mensual</span>
      <div className="w-24 h-24">
        <CircularProgressbar
          value={value}
          text={`${value}%`}
          styles={buildStyles({
            pathColor: '#8f5cff',
            textColor: '#8f5cff',
            trailColor: '#e5e7eb',
            backgroundColor: '#fff',
          })}
        />
      </div>
      <span className="text-xs text-gray-400 mt-2">{text}</span>
    </div>
  );
}

export default ProgressCircleWidget;
