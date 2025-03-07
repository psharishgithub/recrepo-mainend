import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/authoptions';
import { unlink } from 'fs/promises';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const file = await prisma.file.findUnique({
      where: { id: params.fileId }
    });

    if (!file) {
      return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 });
    }

    if (file.uploaderId !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    try {
      await unlink(file.filePath);
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
    }

    await prisma.file.delete({
      where: { id: params.fileId }
    });

    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
