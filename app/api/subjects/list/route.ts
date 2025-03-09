import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic' // This is required

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    return NextResponse.json(subjects)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}
