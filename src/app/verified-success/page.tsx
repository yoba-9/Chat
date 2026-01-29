'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function VerifiedSuccessPage() {
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Card className={`w-full max-w-md ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Email Verified!</CardTitle>
          <CardDescription className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Your email has been successfully verified. You can now log in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => router.push('/login')} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Login
          </Button>
          <p className="text-sm text-center text-gray-500">
            You will be automatically redirected to login in 5 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
