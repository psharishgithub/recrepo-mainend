import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]/authoptions";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    console.log('No session found');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, avatar } = body;
    const userId = session.user.id; 

    const prefix = email.split('@')[0];


    const role = /^\d+$/.test(prefix) ? 'STUDENT' : 'TEACHER';


    const user = await prisma.user.upsert({
      where: { email: email }, 
      update: { name, email, avatar},
      create: { id: userId, name, email, avatar, role }, 
    });

    return NextResponse.json(user);
  } catch (error) {
   
    if (error instanceof Error) {
      if (error.message.includes('P2002')) { 
        console.error('Unique constraint failed:', error);
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      } else {
        console.error('Detailed error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
      }
    } else {
     
      console.error('Unexpected error type:', error);
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  }
}
