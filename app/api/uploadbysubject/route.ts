import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import os from 'os';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authoptions';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const processEndpoint = (process.env.NODE_ENV === 'production' 
  ? process.env.PROD_PROCESS_ENDPOINT 
  : process.env.DEV_PROCESS_ENDPOINT) || 'defaultProcessEndpoint';

async function sendToProcessEndpoint(subjectId: string, subjectCode: string, filePaths: string[], userId: string) {
  try {
    console.log(subjectId, subjectCode, filePaths, userId);
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
      return NextResponse.json({ success: false, message: 'Unauthorized' });
    }

    const userId = session.user.id; 

    const data = await request.formData();

    const subjectName = data.get('subjectName') as string;
    const subjectCode = data.get('subjectCode') as string;
    const regulation = parseInt(data.get('regulation') as string, 10); 
    const department = data.get('department') as string;

    const files = data.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ success: false, message: 'No files uploaded' });
    }

    const tempDir = process.env.NODE_ENV === 'production' ? '/tmp' : 'C:\\Users\\Harish\\AppData\\Local\\Temp';

    const filePaths = await Promise.all(files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(tempDir, file.name);
      await writeFile(filePath, new Uint8Array(buffer));
      console.log(`File saved to ${filePath}`);
      return filePath; // Ensure file paths are compatible with the environment
    }));

    const subject = await prisma.subject.upsert({
      where: { code: subjectCode },
      update: {
        name: subjectName,
        department,
        regulation,
        files: {
          create: filePaths.map(filePath => ({
            filePath,
            uploaderId: userId,
          })),
        },
      },
      create: {
        name: subjectName,
        code: subjectCode,
        department,
        regulation,
        aggregatedContent: "",
        files: {
          create: filePaths.map(filePath => ({
            filePath,
            uploaderId: userId,
          })),
        },
      },
    });

    // Send data to /process endpoint
    const processResponse = await sendToProcessEndpoint(subject.id, subject.code, filePaths, userId);
    console.log(processResponse.data);

    return NextResponse.json({ 
      success: true, 
      message: 'Files and subject uploaded successfully', 
      subject,
      processResult: processResponse.data
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' });
  }
}