// app/api/admin/calls/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const sampleData = [
    {
      id: '1',
      user: 'Alice',
      timestamp: new Date().toISOString(),
      duration: 45,
      question: 'How do I reset my password?',
    },
    {
      id: '2',
      user: 'Bob',
      timestamp: new Date().toISOString(),
      duration: 30,
      question: 'How do I update my billing info?',
    },
    {
      id: '3',
      user: 'Alice',
      timestamp: new Date().toISOString(),
      duration: 40,
      question: 'How do I reset my password?',
    },
  ];

  return NextResponse.json(sampleData);
}
