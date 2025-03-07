'use client'
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

interface SubjectTileProps {
  name: string;
  code: string;
  regulation: number;
}

export default function SubjectTile({ name, code, regulation }: SubjectTileProps) {
  return (
    <Link href={`/subject/${code}`} passHref>
      <Card className="bg-stone-900 border-transparent h-full w-full min-h-[220px] rounded-[20px] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10 hover:border-2 hover:border-white/50 flex flex-col">
        <CardHeader className="flex-grow">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold line-clamp-3">
            {name}
          </h2>
        </CardHeader>
        <CardFooter className="mt-auto pt-0">
          <div className="w-full flex flex-col gap-1">
            <p className="text-white/50 text-sm">Code: {code}</p>
            <p className="text-white/50 text-sm">Reg: {regulation}</p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}