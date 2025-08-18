"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResultsChart } from "@/components/results-chart"
import { ResultsSummary } from "@/components/results-summary"
import { ResultsTable } from "@/components/results-table"
import { CandidateCard } from "@/components/candidate-card"
import { RefreshCw, BarChart3, Table, Grid, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { Election, VoteResults } from "@/lib/types"
import { formatTimestamp, getElectionStatus } from "@/lib/blockchain"

interface ResultsDashboardProps {
  election: Election
}

export function ResultsDashboard({ election }: ResultsDashboardProps) {
  const [results, setResults] = useState<VoteResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchResults = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await apiClient.getResults(election.id)
      setResults(response)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch results")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()

    // Auto-refresh results every 30 seconds for active elections
    let interval: NodeJS.Timeout | null = null
    if (election.isActive) {
      interval = setInterval(fetchResults, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [election.id, election.isActive])

  if (loading && !results) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Loading Results...</CardTitle>
          <CardDescription>Fetching the latest election results</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!results) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>No Results Available</CardTitle>
          <CardDescription>Results will appear once voting begins</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (results.hasVotes === false || results.totalVotes === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle>Results Hidden</CardTitle>
          <CardDescription>
            Results will be displayed once at least one registered voter has cast their vote.
          </CardDescription>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={fetchResults} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Check for Votes
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                {election.title} - Results
              </CardTitle>
              <CardDescription className="mt-2">{election.description}</CardDescription>
              <div className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchResults} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <ResultsSummary election={election} candidates={results.candidates} totalVotes={results.totalVotes} />

      {/* Results Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="candidates" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Candidates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResultsChart candidates={results.candidates} totalVotes={results.totalVotes} chartType="bar" />
            <ResultsChart candidates={results.candidates} totalVotes={results.totalVotes} chartType="pie" />
          </div>
          <ResultsTable candidates={results.candidates} totalVotes={results.totalVotes} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResultsChart candidates={results.candidates} totalVotes={results.totalVotes} chartType="bar" />
            <ResultsChart candidates={results.candidates} totalVotes={results.totalVotes} chartType="pie" />
          </div>
        </TabsContent>

        <TabsContent value="table">
          <ResultsTable candidates={results.candidates} totalVotes={results.totalVotes} />
        </TabsContent>

        <TabsContent value="candidates">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onVote={() => {}} // No voting in results view
                isVoting={false}
                hasVoted={true} // Disable voting
                showResults={true}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Election Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Election Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Election Period</p>
              <p>
                {formatTimestamp(election.startTime)} - {formatTimestamp(election.endTime)}
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Status</p>
              <p>{getElectionStatus(election)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Total Candidates</p>
              <p>{results.candidates.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Updates Notice */}
      {election.isActive && (
        <Alert>
          <RefreshCw className="h-4 w-4" />
          <AlertDescription>
            This election is currently active. Results are updated automatically every 30 seconds.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
