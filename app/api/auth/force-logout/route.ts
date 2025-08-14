import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Force clear all auth state
    const response = NextResponse.json({ message: 'Force logout successful' });
    
    // Clear all possible auth cookies
    response.cookies.delete('token');
    response.cookies.delete('session');
    
    // Set expired cookies to ensure cleanup
    response.cookies.set('token', '', { 
      expires: new Date(0), 
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Force logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
