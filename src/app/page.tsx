>'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kzmlgmxscnlhiltlsgks.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6bWxnbXhzY25saGlsdGxzZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjcwNDgsImV4cCI6MjA2NzgwMzA0OH0.24vdmnIcli9FUQ8B9g6_XSnsaLcKIsbyZEeraF2E58c'
);

type Task = {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  assigned_to: string;
  user_name?: string;
};

export default function Page() {
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isPlanner, setIsPlanner] = useState<boolean>(false);

  useEffect(() => {
    const storedId = localStorage.getItem('user_id');
    const storedRole = localStorage.getItem('user_role');
    const storedName = localStorage.getItem('user_name');
    if (storedId && storedName) {
      setUserId(storedId);
      setUserName(storedName);
      setIsPlanner(storedRole === 'planner');
    } else {
      const name = prompt('Enter your name to register:');
      if (name) registerUser(name);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTasks();
      const interval = setInterval(fetchTasks, 5000); // Auto-sync every 5 seconds
      return () => clearInterval(interval);
    }
  }, [userId]);

  async function registerUser(name: string) {
    const role = name.toLowerCase() === 'planner' ? 'planner' : 'user';
    const { data } = await supabase
      .from('users')
      .insert([{ name, role }])
      .select()
      .single();

    if (data) {
      localStorage.setItem('user_id', data.id);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_name', name);
      setUserId(data.id);
      setUserName(name);
      setIsPlanner(role === 'planner');
    }
  }

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*, users(name)')
      .eq('assigned_to', userId);
    const enriched = (data ?? []).map((t: {
      id: string;
      title: string;
      status: 'todo' | 'in_progress' | 'done';
      assigned_to: string;
      users?: { name?: string };
    }) => ({
      ...t,
      user_name: t.users?.name ?? 'Unknown',
    }));
    setTasks(enriched);
  }

  async function handleAddTask() {
    const title = prompt('Task title:');
    const { data: users } = await supabase.from('users').select('id, name');
    if (!users || users.length === 0) return alert('No users to assign to.');
    const nameList = users.map((u) => u.name).join(', ');
    const assigneeName = prompt(`Assign to user name:\n${nameList}`);
    const assignee = users.find((u) => u.name === assigneeName);
    if (!title || !assignee) return;
    const { data } = await supabase
      .from('tasks')
      .insert([{ title, assigned_to: assignee.id }])
      .select();
    if (data) setTasks((prev) => [...prev, ...data.map((t) => ({ ...t, user_name: assignee.name }))]);
  }

  async function updateStatus(id: string, status: Task['status']) {
    await supabase.from('tasks').update({ status }).eq('id', id);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center">HouseOPS – Task Checklist</h1>
      <p className="text-center text-sm text-gray-500">Logged in as: {userName}</p>
      {isPlanner && (
        <button
          onClick={handleAddTask}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Task
        </button>
      )}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center border p-2 rounded shadow-sm"
          >
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-gray-500">Assigned to: {task.user_name}</p>
            </div>
            <select
              value={task.status}
              onChange={(e) => updateStatus(task.id, e.target.value as Task['status'])}
              className="border rounded px-2 py-1 mt-2 sm:mt-0"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
