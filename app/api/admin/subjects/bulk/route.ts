import { NextRequest, NextResponse } from "next/server";
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authoptions";

const prisma = new PrismaClient();

interface SubjectRow {
  code: string;
  name: string;
  department: string;
  regulation: string;
}

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

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    // Read and parse the CSV file
    const csvText = await file.text();
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as SubjectRow[];

    // Validate the CSV structure
    const requiredColumns = ['code', 'name', 'department', 'regulation'];
    const firstRow = records[0];
    const hasAllColumns = requiredColumns.every(col => Object.keys(firstRow).includes(col));

    if (!hasAllColumns) {
      return NextResponse.json({
        success: false,
        message: 'Invalid CSV format. Required columns: code, name, department, regulation'
      }, { status: 400 });
    }

    // Process each row and create subjects
    const createdSubjects = await Promise.all(
      records.map(async (row) => {
        try {
          return await prisma.subject.upsert({
            where: { code: row.code },
            update: {
              name: row.name,
              department: row.department,
              regulation: parseInt(row.regulation),
            },
            create: {
              code: row.code,
              name: row.name,
              department: row.department,
              regulation: parseInt(row.regulation),
              aggregatedContent: "",
            },
          });
        } catch (error) {
          console.error(`Error processing row with code ${row.code}:`, error);
          return null;
        }
      })
    );

    const successfulUploads = createdSubjects.filter(subject => subject !== null);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${successfulUploads.length} subjects`,
      subjects: successfulUploads
    });

  } catch (error) {
    console.error('Error processing CSV:', error);
    return NextResponse.json({
      success: false,
      message: 'Error processing CSV file'
    }, { status: 500 });
  }
}
