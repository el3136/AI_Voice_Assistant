// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card'; // adjust if using shadcn
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

type CallLog = {
  id: string;
  user: string;
  timestamp: string;
  duration: number;
  question: string;
};

export default function AdminDashboard() {
  const [calls, setCalls] = useState<CallLog[]>([]);

  useEffect(() => {
    // Replace with actual backend call (e.g., /api/admin/calls)
    fetch('/api/admin/calls')
      .then(res => res.json())
      .then(data => setCalls(data));
  }, []);

  const commonQuestions = calls.reduce((acc, call) => {
    acc[call.question] = (acc[call.question] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = {
    labels: Object.keys(commonQuestions),
    datasets: [
      {
        label: 'Question Frequency',
        data: Object.values(commonQuestions),
        backgroundColor: '#4F46E5',
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Common Questions</h2>
          <Bar data={barData} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Recent Calls</h2>
          <ul className="space-y-2">
            {calls.map(call => (
              <li key={call.id} className="border-b pb-2">
                <strong>{call.user}</strong> asked <em>&quot;{call.question}&quot;</em> at{' '}
                {new Date(call.timestamp).toLocaleString()} (Duration: {call.duration}s)
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
