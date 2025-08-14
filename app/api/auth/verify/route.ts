import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Verify API: Processing request');
    
    // Forward cookies from request to backend
    const cookieHeader = request.headers.get('cookie') || '';
    console.log('Verify API: Cookie header:', cookieHeader ? 'present' : 'missing');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    console.log('Verify API: Backend response status:', response.status);
    
    const data = await response.json();
    console.log('Verify API: Backend response data:', {
      hasUser: !!data.user,
      isValid: data.valid,
      error: data.error
    });

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Verify API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
