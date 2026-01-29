'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSession, signIn, signOut, signUp } from '@/components/providers'
import { Geologica } from 'next/font/google'

export default function LoginPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
      }
      // Note: redirection is handled inside signIn to '/', no need for router.push here if successful
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Zemenay Chat Logo"
              width={64}
              height={64}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center text-sm text-gray-400">
            Enter your email or username and password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="identifier">Email or Username</Label>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="m@example.com or username"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder='password'
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Sign In</Button>
              <Button onClick={() => signIn("google", { callbackUrl: '/' })}>Sign in with Google</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </div>
          <div className="text-center text-sm">
            <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300">
              Forgot your password?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}