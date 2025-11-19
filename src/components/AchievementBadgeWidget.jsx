import React from 'react';
import { FaMedal } from 'react-icons/fa';

function AchievementBadgeWidget({ show = false, text = '¡Meta alcanzada!' }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex flex-col items-center relative">
      <FaMedal className="text-yellow-400 text-4xl mb-2" />
      <span className="font-semibold text-[#8f5cff] text-lg">{text}</span>
      <span className="text-xs text-gray-400 mt-1">Ejemplo: 10 pedidos completados</span>
    </div>
  );
}

export default AchievementBadgeWidget;
