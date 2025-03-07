import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/authoptions';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email! }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { code, name, department, regulation } = await request.json();

    // Validate input
    if (!code || !name || !department || !regulation) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create subject
    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        department,
        regulation,
        aggregatedContent: '', // Empty initially
      },
    });

    return NextResponse.json(subject);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Subject code already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
