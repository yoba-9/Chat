import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function GettingStarted() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="Zemenay Chat Logo"
          width={120}
          height={120}
          className="mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold mb-2">Zemenay Chat</h1>
        <p className="text-xl mb-1">Ethiopia&apos;s own chat app</p>
        <p className="text-lg text-muted-foreground mb-8">It&apos;s fast and secure</p>
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-600 transition-colors duration-200 text-lg font-semibold inline-flex items-center"
        >
          Start messaging
          <ArrowUpRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}