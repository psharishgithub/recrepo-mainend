import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authoptions';
import axios from 'axios';

const prisma = new PrismaClient();

const processEndpoint = "http://localhost:8000/process";

async function sendToProcessEndpoint(subjectId: string, subjectCode: string, filePaths: string[], userId: string) {
  try {
    const response = await axios.post(processEndpoint, {
      subject_id: subjectId,
      subject_code: subjectCode,
      filepaths: filePaths,
      user_id: userId
    });
    return response;
  } catch (error) {
    console.error('Error sending data to /process endpoint:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const subjectCode = data.get('subjectCode') as string;
    const files = data.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ success: false, message: 'No files uploaded' });
    }

    const tempDir = 'C:\\Users\\Harish\\AppData\\Local\\Temp';

    const filePaths = await Promise.all(files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(tempDir, file.name);
      await writeFile(filePath, new Uint8Array(buffer));
      return filePath;
    }));

    const subject = await prisma.subject.update({
      where: { code: subjectCode },
      include: {
        files: {
          include: {
            uploader: true
          }
        }
      },
      data: {
        files: {
          create: filePaths.map(filePath => ({
            filePath,
            uploaderId: session.user.id,
            uploadedAt: new Date(), // Explicitly set upload time
          })),
        },
      },
    });

    // Send data to /process endpoint
    try {
      const processResponse = await sendToProcessEndpoint(subject.id, subject.code, filePaths, session.user.id);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Files uploaded and processed successfully',
        subject,
        uploadedBy: session.user.name || session.user.email,
        processResult: processResponse.data,
        processed: true
      });
    } catch (processError) {
      // Return success but indicate processing failed
      return NextResponse.json({
        success: true,
        message: 'Files uploaded but processing failed',
        subject,
        uploadedBy: session.user.name || session.user.email,
        processError: 'Failed to process files',
        processed: false
      });
    }

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
