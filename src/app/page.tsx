'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import '/calendar.css';

export default function Page() {
  const [resources, setResources] = useState([
    { id: 'unassigned', title: '🕓 Unassigned Tasks' },
    { id: 'jeff', title: 'Jeff' },
    { id: 'jacob', title: 'Jacob' },
    { id: 'mum', title: 'Mum' },
  ]);

  const [events, setEvents] = useState([
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
      resourceId: 'unassigned',
      color: '#2196F3',
    },
  ]);

  function handleAddTask() {
    const newTask = {
      id: String(Date.now()),
      title: 'New Shift ✏️',
      start: new Date().setHours(9, 0),
      end: new Date().setHours(10, 0),
      resourceId: 'unassigned',
      color: '#9E9E9E',
    };
    setEvents((prev) => [...prev, newTask]);
  }

  function handleAddPerson() {
    const name = prompt('New person name:');
    if (name) {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      setResources([...resources, { id, title: name }]);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">HouseOPS – Daily Timeline</h1>
      <div className="flex gap-4">
        <button
          onClick={handleAddTask}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Task
        </button>
        <button
          onClick={handleAddPerson}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add Person
        </button>
      </div>
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView="resourceTimelineDay"
        headerToolbar={{ left: 'title', center: '', right: 'prev,today,next' }}
        slotMinTime="04:00:00"
        slotMaxTime="24:00:00"
        resourceAreaWidth="20%"
        aspectRatio={1.5}
        resources={resources}
        events={events}
        editable={true}
        selectable={true}
        eventDrop={(info) => {
          const updated = events.map((ev) =>
            ev.id === info.event.id
              ? {
                  ...ev,
                  start: info.event.start,
                  end: info.event.end,
                  resourceId: info.event.getResources()?.[0]?.id || 'unassigned',
                }
              : ev
          );
          setEvents(updated);
        }}
        eventClick={(info) => {
          const title = prompt('Rename task:', info.event.title);
          if (title) {
            const updated = events.map((e) =>
              e.id === info.event.id ? { ...e, title } : e
            );
            setEvents(updated);
          }
        }}
      />
    </div>
  );
}
