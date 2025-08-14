import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params;
    console.log('Favorite services details request for customer:', customerId);
    
    // Forward request to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favorite-services/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    console.log('Favorite services details backend response status:', response.status);
    
    const data = await response.json();
    console.log('Favorite services details backend response data:', data);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Favorite services details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
