'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, ArrowRight, ArrowLeft } from 'lucide-react'
import { useTheme } from 'next-themes'
import { signIn, signUp } from '@/components/providers'


export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: ''
  });
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { theme } = useTheme()

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }
    setStep(2)
    setLoading(false)
  }

  const handlePrevStep = () => {
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const newUser = {
        id: formData.username || `user-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username || formData.email}`
      }

      const result = await signUp(newUser as any);

      if (result.error) {
        setError(result.error);
      } else {
        alert('Account created successfully!');
        router.push('/login');
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      console.error('Signup error:', error)
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
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {step === 1 ? "Enter your email and password" : "Complete your profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
            <div className="grid gap-4">
              {step === 1 ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
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
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm your password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
                    />
                  </div>
                </>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {step === 1 ? (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {step === 2 && (
            <Button variant="ghost" className={`w-full ${theme === 'dark' ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`} onClick={handlePrevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          <div className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Already have an account?{" "}
            <Link href="/login" className={`font-semibold ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}