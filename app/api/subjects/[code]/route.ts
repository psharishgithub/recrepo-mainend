import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export async  function GET(request: NextRequest, {params}: {params: any}){
    const {code} = params
    try {
        const subject = await prisma.subject.findUnique({
            where: {
                code: code
            },
            include: {
                files: true 
            }
        })
        if (!subject) {
            return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
          }
        return NextResponse.json(subject)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Error fetching subject' }, { status: 500 });
    }

    
}