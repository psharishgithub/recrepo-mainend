import { NextRequest, NextResponse } from "next/server";


export function GET(request: NextRequest){
    return NextResponse.json({'message' : "Upload to subject"})
}