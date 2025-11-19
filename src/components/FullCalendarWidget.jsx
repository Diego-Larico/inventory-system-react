import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import '../assets/fullcalendar-daygrid.css';
import '../assets/fullcalendar-violet.css';

function FullCalendarWidget() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-col items-center w-full max-w-xl mx-auto" style={{ minHeight: 0 }}>
      <span className="font-semibold text-gray-700 text-lg mb-2 block">Calendario</span>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height={520}
        contentHeight={520}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        locale={esLocale}
        events={[]}
      />
    </div>
  );
}

export default FullCalendarWidget;
