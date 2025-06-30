// src/app/api/frameworks/route.js
import { NextResponse } from 'next/server';

// GET /api/frameworks - List all frameworks
export async function GET(request) {
  try {
    // TODO: Replace with actual database call
    const mockFrameworks = [
      {
        id: 1,
        name: "SPIN Selling Framework",
        description: "Strategic selling methodology",
        created_at: "2024-01-01"
      }
    ];

    return NextResponse.json(mockFrameworks);
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frameworks' },
      { status: 500 }
    );
  }
}

// POST /api/frameworks - Create new framework
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Log what we received for debugging
    console.log('Received framework data:', body);
    
    // TODO: Add validation here
    if (!body.name || !body.levels || !body.steps) {
      return NextResponse.json(
        { error: 'Missing required fields: name, levels, or steps' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database save
    const mockSavedFramework = {
      id: Date.now(), // Temporary ID
      ...body,
      created_at: new Date().toISOString()
    };

    console.log('Mock saved framework:', mockSavedFramework);

    return NextResponse.json(mockSavedFramework, { status: 201 });
  } catch (error) {
    console.error('Error creating framework:', error);
    return NextResponse.json(
      { error: 'Failed to create framework' },
      { status: 500 }
    );
  }
}