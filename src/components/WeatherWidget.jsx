import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { WiDaySunny, WiCloudy, WiRain, WiSnow } from 'react-icons/wi';

function WeatherWidget({ isCollapsed = false }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ejemplo: Lima, Perú (puedes cambiar la ciudad)
  const city = 'Chincha';
  const apiKey = '296fb90a46e4e062d32659d95ee01d09'; // Reemplaza por tu API key de OpenWeatherMap

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Puedes obtener una API key gratuita en https://openweathermap.org/api
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`
        );
        setWeather(res.data);
      } catch (err) {
        setError('No se pudo obtener el clima');
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  function getIcon(main) {
    switch (main) {
      case 'Clear': return <WiDaySunny className="text-yellow-400 text-4xl" />;
      case 'Clouds': return <WiCloudy className="text-blue-400 text-4xl" />;
      case 'Rain': return <WiRain className="text-blue-300 text-4xl" />;
      case 'Snow': return <WiSnow className="text-blue-200 text-4xl" />;
      default: return <WiDaySunny className="text-yellow-400 text-4xl" />;
    }
  }

  if (isCollapsed) {
    return (
      <motion.div 
        className="w-full p-2 bg-white/5 rounded-lg border border-gray-700/50 hover:bg-white/10 transition-all cursor-pointer"
        whileHover={{ scale: 1.05 }}
      >
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-xs text-center">Error</div>
        ) : weather ? (
          <div className="flex flex-col items-center gap-1">
            {getIcon(weather.weather[0].main)}
            <span className="text-white text-sm font-bold">{Math.round(weather.main.temp)}°</span>
          </div>
        ) : null}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-full p-4 bg-white/5 rounded-xl border border-gray-700/50 hover:bg-white/10 transition-all backdrop-blur-sm"
      whileHover={{ scale: 1.02 }}
    >
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="text-center">
          <span className="text-sm text-red-400">{error}</span>
        </div>
      ) : weather ? (
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-3">
            {getIcon(weather.weather[0].main)}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{Math.round(weather.main.temp)}</span>
              <span className="text-xl text-gray-400">°C</span>
            </div>
            <p className="text-xs text-gray-400 capitalize mt-1">{weather.weather[0].description}</p>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="text-blue-400">💧</span> {weather.main.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <span>📍</span> {weather.name}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

export default WeatherWidget;
