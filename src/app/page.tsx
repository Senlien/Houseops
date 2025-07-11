'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kzmlgmxscnlhiltlsgks.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bWxnbXhzY25saGlsdGxzZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjcwNDgsImV4cCI6MjA2NzgwMzA0OH0.24vdmnIcli9FUQ8B9g6_XSnsaLcKIsbyZEeraF2E58c'
);

type Resource = {
  id: string;
  title: string;
};

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource_id: string;
  resourceId?: string;
  color?: string;
};

export default function Page() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    const { data: resData } = await supabase.from('resources').select('*');
    const { data: evtData } = await supabase.from('events').select('*');

    setResources(resData ?? []);
    setEvents(
      (evtData ?? []).map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
        resourceId: e.resource_id,
      }))
    );
  }

  async function handleAddTask() {
    const newTask = {
      id: String(Date.now()),
      title: 'New Shift ✏️',
      start: new Date().toISOString(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
      resource_id: 'unassigned',
      color: '#9E9E9E',
    };
    await supabase.from('events').insert([newTask]);
    setEvents((prev) => [
      ...prev,
      {
        ...newTask,
        start: new Date(newTask.start),
        end: new Date(newTask.end),
        resourceId: newTask.resource_id,
      },
    ]);
  }

  async function handleAddPerson() {
    const name = prompt('New person name:');
    if (name) {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      const newRes = { id, title: name };
      await supabase.from('resources').insert([newRes]);
      setResources((prev) => [...prev, newRes]);
    }
  }

  async function handleRenameTask(info: { event: { id: string; title: string } }) {
    const title = prompt('Rename task:', info.event.title);
    if (title) {
      await supabase.from('events').update({ title }).eq('id', info.event.id);
      const updated = events.map((e) =>
        e.id === info.event.id ? { ...e, title } : e
      );
      setEvents(updated);
    }
  }

  async function handleDropTask(info: { event: { id: string; start: Date; end: Date; getResources: () => { id: string }[] } }) {
    const newStart = info.event.start;
    const newEnd = info.event.end;
    const newResourceId = info.event.getResources()?.[0]?.id || 'unassigned';
    await supabase
      .from('events')
      .update({
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
        resource_id: newResourceId,
      })
      .eq('id', info.event.id);

    const updated = events.map((ev) =>
      ev.id === info.event.id
        ? {
            ...ev,
            start: newStart,
            end: newEnd,
            resourceId: newResourceId,
          }
        : ev
    );
    setEvents(updated);
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
        eventDrop={handleDropTask}
        eventClick={handleRenameTask}
      />
    </div>
  );
}
