"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Plus, Users, BarChart3, AlertCircle, CheckCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useBlockchain } from "@/components/blockchain-provider"
import { validateElectionData, validateCandidateData, validateElectionTimes } from "@/lib/utils/validation"

export function AdminPanel() {
  const { isAdmin } = useBlockchain()
  const [activeTab, setActiveTab] = useState("elections")

  // Election creation state
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  })
  const [electionLoading, setElectionLoading] = useState(false)
  const [electionError, setElectionError] = useState("")
  const [electionSuccess, setElectionSuccess] = useState("")

  // Candidate creation state
  const [candidateForm, setCandidateForm] = useState({
    electionId: "",
    name: "",
    position: "",
    manifesto: "",
  })
  const [candidateLoading, setCandidateLoading] = useState(false)
  const [candidateError, setCandidateError] = useState("")
  const [candidateSuccess, setCandidateSuccess] = useState("")

  if (!isAdmin) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You need administrator privileges to access this panel.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault()
    setElectionLoading(true)
    setElectionError("")
    setElectionSuccess("")

    try {
      // Validate form data
      const validationError = validateElectionData(electionForm.title, electionForm.description)
      if (validationError) {
        setElectionError(validationError)
        return
      }

      // Convert dates to timestamps
      const startTimestamp = Math.floor(
        new Date(`${electionForm.startDate}T${electionForm.startTime}`).getTime() / 1000,
      )
      const endTimestamp = Math.floor(new Date(`${electionForm.endDate}T${electionForm.endTime}`).getTime() / 1000)

      // Validate timestamps
      const timeValidationError = validateElectionTimes(startTimestamp, endTimestamp)
      if (timeValidationError) {
        setElectionError(timeValidationError)
        return
      }

      await apiClient.createElection({
        title: electionForm.title,
        description: electionForm.description,
        startTime: startTimestamp,
        endTime: endTimestamp,
      })

      setElectionSuccess("Election created successfully!")
      setElectionForm({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      })
    } catch (err) {
      setElectionError(err instanceof Error ? err.message : "Failed to create election")
    } finally {
      setElectionLoading(false)
    }
  }

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCandidateLoading(true)
    setCandidateError("")
    setCandidateSuccess("")

    try {
      // Validate form data
      const validationError = validateCandidateData(candidateForm.name, candidateForm.position, candidateForm.manifesto)
      if (validationError) {
        setCandidateError(validationError)
        return
      }

      if (!candidateForm.electionId) {
        setCandidateError("Please select an election")
        return
      }

      await apiClient.addCandidate({
        electionId: Number.parseInt(candidateForm.electionId),
        name: candidateForm.name,
        position: candidateForm.position,
        manifesto: candidateForm.manifesto,
      })

      setCandidateSuccess("Candidate added successfully!")
      setCandidateForm({
        electionId: candidateForm.electionId, // Keep election selected
        name: "",
        position: "",
        manifesto: "",
      })
    } catch (err) {
      setCandidateError(err instanceof Error ? err.message : "Failed to add candidate")
    } finally {
      setCandidateLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Admin Panel
          </CardTitle>
          <CardDescription>Manage elections, candidates, and system settings</CardDescription>
          <Badge className="w-fit">Administrator Access</Badge>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="elections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Election
              </CardTitle>
              <CardDescription>Set up a new election with voting period and details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateElection} className="space-y-4">
                {electionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{electionError}</AlertDescription>
                  </Alert>
                )}

                {electionSuccess && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{electionSuccess}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Election Title</Label>
                    <Input
                      id="title"
                      value={electionForm.title}
                      onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                      placeholder="e.g., Student Union Election 2024"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={electionForm.description}
                      onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                      placeholder="Brief description of the election"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={electionForm.startDate}
                      onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={electionForm.startTime}
                      onChange={(e) => setElectionForm({ ...electionForm, startTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={electionForm.endDate}
                      onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={electionForm.endTime}
                      onChange={(e) => setElectionForm({ ...electionForm, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={electionLoading} className="w-full">
                  {electionLoading ? "Creating Election..." : "Create Election"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Add Candidate
              </CardTitle>
              <CardDescription>Add candidates to existing elections</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCandidate} className="space-y-4">
                {candidateError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{candidateError}</AlertDescription>
                  </Alert>
                )}

                {candidateSuccess && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{candidateSuccess}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="electionId">Election ID</Label>
                  <Input
                    id="electionId"
                    type="number"
                    value={candidateForm.electionId}
                    onChange={(e) => setCandidateForm({ ...candidateForm, electionId: e.target.value })}
                    placeholder="Enter election ID"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the ID of the election you want to add this candidate to
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateName">Candidate Name</Label>
                    <Input
                      id="candidateName"
                      value={candidateForm.name}
                      onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                      placeholder="Full name of the candidate"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={candidateForm.position}
                      onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })}
                      placeholder="e.g., President, Vice President"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manifesto">Manifesto</Label>
                  <Textarea
                    id="manifesto"
                    value={candidateForm.manifesto}
                    onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                    placeholder="Candidate's manifesto and campaign promises..."
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Minimum 50 characters required</p>
                </div>

                <Button type="submit" disabled={candidateLoading} className="w-full">
                  {candidateLoading ? "Adding Candidate..." : "Add Candidate"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Analytics
              </CardTitle>
              <CardDescription>Overview of system usage and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analytics dashboard coming soon...</p>
                <p className="text-sm">This will show election statistics, voter participation, and system metrics.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
