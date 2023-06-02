'use client';
import { useRouter } from "next/navigation";

export default function TipRow({
  slug,
  children,
}: {
  slug: string
  children: React.ReactNode
}) {
  const router = useRouter();

  return (
    <tr className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/${slug}`)}>
      {children}
    </tr>
  )
}