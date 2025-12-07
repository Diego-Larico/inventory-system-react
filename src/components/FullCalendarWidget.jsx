import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import '../assets/fullcalendar-daygrid.css';
import '../assets/fullcalendar-violet.css';

function FullCalendarWidget() {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center mx-auto"
      style={{ width: '100%', maxWidth: 700, minWidth: 500, minHeight: 560, boxSizing: 'border-box' }}
    >
      <h3 className="text-lg font-semibold mb-4 text-[#8f5cff] dark:text-[#a78bfa]">📅 Calendario</h3>
      <div style={{ width: '100%', minWidth: 480, maxWidth: 680, height: 500, minHeight: 500, maxHeight: 500, boxSizing: 'border-box', marginBottom: 0 }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height={500}
          contentHeight={500}
          locale={esLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          events={[]}
        />
      </div>
    </div>
  );
}

export default FullCalendarWidget;
