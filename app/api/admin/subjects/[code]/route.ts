import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/authoptions';

export async function DELETE(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email! }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // First find the subject to get its ID
    const subject = await prisma.subject.findUnique({
      where: {
        code: params.code,
      },
    });

    if (!subject) {
      return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }

    // Delete in transaction to ensure all related records are deleted
    await prisma.$transaction(async (tx) => {
      // Delete all embeddings related to the subject
      await tx.embedding.deleteMany({
        where: {
          subjectId: subject.id,
        },
      });

      // Delete all files related to the subject
      await tx.file.deleteMany({
        where: {
          subjectId: subject.id,
        },
      });

      // Finally delete the subject
      await tx.subject.delete({
        where: {
          id: subject.id,
        },
      });
    });

    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
