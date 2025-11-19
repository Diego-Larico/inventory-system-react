import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { WiDaySunny, WiCloudy, WiRain, WiSnow } from 'react-icons/wi';

function WeatherWidget() {
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
      case 'Clear': return <WiDaySunny className="text-yellow-400 text-5xl" />;
      case 'Clouds': return <WiCloudy className="text-[#8f5cff] text-5xl" />;
      case 'Rain': return <WiRain className="text-[#6e7ff3] text-5xl" />;
      case 'Snow': return <WiSnow className="text-[#b6aaff] text-5xl" />;
      default: return <WiDaySunny className="text-yellow-400 text-5xl" />;
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#8f5cff] to-[#6e7ff3] rounded-2xl shadow-lg p-6 mb-4 flex flex-col items-center min-w-[180px] w-full max-w-[320px] text-white">
      <span className="font-semibold text-white text-lg mb-3 block">Clima local</span>
      {loading ? (
        <span className="text-sm text-white opacity-80">Cargando...</span>
      ) : error ? (
        <span className="text-sm text-white opacity-80">{error}</span>
      ) : weather ? (
        <div className="flex flex-col items-center gap-2">
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            {getIcon(weather.weather[0].main)}
          </div>
          <span className="text-4xl font-bold text-white">{Math.round(weather.main.temp)}°C</span>
          <span className="text-sm text-white opacity-90 capitalize">{weather.weather[0].description}</span>
          <div className="flex gap-4 mt-2 text-xs text-white opacity-80">
            <span>💧 {weather.main.humidity}%</span>
            <span>📍 {weather.name}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default WeatherWidget;
