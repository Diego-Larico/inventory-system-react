// ...existing code...
import DashboardCards from './DashboardCards';
import DashboardChart from './DashboardChart';
import DashboardBarChart from './DashboardBarChart';
import DashboardRadarChart from './DashboardRadarChart';

import DashboardLineChart from './DashboardLineChart';
import WeatherWidget from './WeatherWidget';
import ProgressCircleWidget from './ProgressCircleWidget';
import FullCalendarWidget from './FullCalendarWidget';
import TodoListWidget from './TodoListWidget';

function DashboardMain() {
  return (
    <main className="flex-1 bg-gray-50 min-h-screen p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Bienvenido al sistema de inventario para taller de costura. Visualiza y gestiona materiales, productos y pedidos.</p>
      <DashboardCards />
      <section className="flex flex-col md:flex-row gap-6 mb-8 w-full">
        <div className="flex-1 flex flex-col gap-6">
          <DashboardChart />
          <DashboardRadarChart />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <DashboardBarChart />
          <DashboardLineChart />
        </div>
      </section>
      {/* Calendario a la izquierda, progreso y recordatorio a la derecha */}
      <section className="flex flex-col md:flex-row gap-6 mb-8 w-full">
        <div className="flex-1 flex flex-col">
          <FullCalendarWidget />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <TodoListWidget />
        </div>
      </section>
    </main>
  );
}

export default DashboardMain;
