"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, AlertCircle, CheckCircle, Info } from "lucide-react"
import { apiClient } from "@/lib/api"
import { validateStudentId } from "@/lib/utils/validation"
import { useWallet } from "@/lib/hooks/useWallet"

interface VoterRegistrationFormProps {
  electionId: number
  electionTitle: string
}

export function VoterRegistrationForm({ electionId, electionTitle }: VoterRegistrationFormProps) {
  const [studentId, setStudentId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const { address, isConnected } = useWallet()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      setError("Please connect your wallet first")
      return
    }

    if (!validateStudentId(studentId)) {
      setError("Invalid student ID format. Please use format: YYYY/XXX (e.g., 2024/001)")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await apiClient.registerVoter({ electionId, studentId })
      setSuccess(true)
      setStudentId("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register voter")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-primary">Registration Successful!</CardTitle>
          <CardDescription>You are now registered for "{electionTitle}"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You can now participate in the election when voting opens. Keep your wallet connected to cast your vote.
            </AlertDescription>
          </Alert>
          <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
            Register Another Student
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl font-semibold">Voter Registration</CardTitle>
        <CardDescription>Register to vote in "{electionTitle}"</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              type="text"
              placeholder="e.g., 2024/001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">Enter your student ID in the format: YYYY/XXX</p>
          </div>

          {isConnected && address && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium text-muted-foreground">Wallet Address:</p>
              <p className="text-xs font-mono break-all">{address}</p>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting || !isConnected} className="w-full" size="lg">
            {isSubmitting ? "Registering..." : "Register to Vote"}
          </Button>

          {!isConnected && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>Please connect your wallet before registering to vote.</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
