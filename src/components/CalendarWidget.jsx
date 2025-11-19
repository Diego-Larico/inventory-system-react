import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../assets/calendar-violet.css';

function CalendarWidget() {
  const [date, setDate] = React.useState(new Date());
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
      <span className="font-semibold text-gray-700 text-lg mb-2 block">Calendario</span>
      <Calendar
        onChange={setDate}
        value={date}
        locale="es-ES"
        className="w-full border-none"
      />
    </div>
  );
}

export default CalendarWidget;
