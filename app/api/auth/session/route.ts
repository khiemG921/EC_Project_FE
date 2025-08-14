import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Set cookie from backend response
    const setCookieHeader = response.headers.get('set-cookie');
    const res = NextResponse.json(data);
    
    if (setCookieHeader) {
      res.headers.set('set-cookie', setCookieHeader);
    }

    return res;
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Forward request to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const data = await response.json();
    
    // Clear cookie
    const res = NextResponse.json(data);
    res.cookies.set('token', '', { maxAge: 0 });
    
    return res;
  } catch (error) {
    console.error('Session delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
