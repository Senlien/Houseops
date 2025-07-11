// Starter for HouseOPS: A web-based, installable timeline planner with people and roles

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/core/index.js';
import '@fullcalendar/resource-timeline/index.js';
import '@fullcalendar/react/dist/vdom'; // needed for React + FullCalendar
import '@fullcalendar/resource-timeline/index.css';

export default function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">HouseOPS – Daily Timeline</h1>
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView="resourceTimelineDay"
        headerToolbar={{ left: 'title', center: '', right: 'prev,today,next' }}
        slotMinTime="04:00:00"
        slotMaxTime="24:00:00"
        aspectRatio={1.5}
        resourceAreaWidth="20%"
        resources={[
          { id: 'jeff', title: 'Jeff' },
          { id: 'jacob', title: 'Jacob' },
          { id: 'mum', title: 'Mum' },
          { id: 'shared', title: 'Shared Duties' },
        ]}
        events={[
          {
            id: '1',
            title: 'INT RAMP – Bin Night 🗑️',
            start: new Date().setHours(5, 0),
            end: new Date().setHours(6, 0),
            resourceId: 'jeff',
            color: '#FFC107',
          },
          {
            id: '2',
            title: 'LEAD LOAD – School Dropoff 🚗',
            start: new Date().setHours(7, 30),
            end: new Date().setHours(8, 30),
            resourceId: 'mum',
            color: '#F44336',
          },
          {
            id: '3',
            title: 'INT DRV – Dishes 🍽️',
            start: new Date().setHours(18, 0),
            end: new Date().setHours(18, 30),
            resourceId: 'shared',
            color: '#2196F3',
          },
        ]}
        editable={true}
        selectable={true}
        eventClick={(info) => alert(`Task: ${info.event.title}`)}
      />
    </div>
  );
}
