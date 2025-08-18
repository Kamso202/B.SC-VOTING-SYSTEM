"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CandidateCard } from "@/components/candidate-card"
import { Vote, AlertCircle, CheckCircle, Clock, Users, RefreshCw } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useWallet } from "@/lib/hooks/useWallet"
import type { Election, Candidate, Voter } from "@/lib/types"
import { formatTimestamp, getElectionStatus, isElectionActive } from "@/lib/blockchain"

interface VotingInterfaceProps {
  election: Election
}

export function VotingInterface({ election }: VotingInterfaceProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [voter, setVoter] = useState<Voter | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const { address, isConnected } = useWallet()

  const electionStatus = getElectionStatus(election)
  const canVote = isElectionActive(election)

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !address) return

      try {
        setLoading(true)

        // Fetch candidates
        const candidatesResponse = await apiClient.getCandidates(election.id)
        setCandidates(candidatesResponse.candidates)

        // Fetch voter information
        try {
          const voterResponse = await apiClient.getVoter(election.id, address)
          setVoter(voterResponse.voter)
        } catch (err) {
          // Voter not registered - this is okay
          setVoter(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load voting data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [election.id, address, isConnected])

  const handleVote = async (candidateId: number) => {
    if (!isConnected || !address || !voter?.isRegistered) {
      setError("Please ensure you are connected and registered to vote")
      return
    }

    setIsVoting(true)
    setError("")

    try {
      await apiClient.castVote({ electionId: election.id, candidateId })
      setSuccess(true)

      // Update voter status
      setVoter((prev) => (prev ? { ...prev, hasVoted: true, votedCandidateId: candidateId } : null))

      // Refresh candidates to get updated vote counts
      const candidatesResponse = await apiClient.getCandidates(election.id)
      setCandidates(candidatesResponse.candidates)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cast vote")
    } finally {
      setIsVoting(false)
    }
  }

  const refreshData = async () => {
    if (!isConnected || !address) return

    try {
      setLoading(true)
      const candidatesResponse = await apiClient.getCandidates(election.id)
      setCandidates(candidatesResponse.candidates)

      if (voter?.isRegistered) {
        const voterResponse = await apiClient.getVoter(election.id, address)
        setVoter(voterResponse.voter)
      }
    } catch (err) {
      setError("Failed to refresh data")
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>Please connect your wallet to participate in voting</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Loading Election Data...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!voter?.isRegistered) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Registration Required</CardTitle>
          <CardDescription>You must register before you can vote in this election</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => window.location.reload()}>Go to Registration</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Election Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Vote className="h-6 w-6" />
                {election.title}
              </CardTitle>
              <CardDescription className="mt-2">{election.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={canVote ? "default" : "secondary"}>{electionStatus}</Badge>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Voting Period</p>
                <p className="text-muted-foreground">
                  {formatTimestamp(election.startTime)} - {formatTimestamp(election.endTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Total Votes Cast</p>
                <p className="text-muted-foreground">{election.totalVotes}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Your Status</p>
                <p className="text-muted-foreground">{voter.hasVoted ? "Voted" : "Ready to Vote"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Your vote has been successfully cast and recorded on the blockchain!</AlertDescription>
        </Alert>
      )}

      {!canVote && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {electionStatus === "Upcoming"
              ? "This election has not started yet."
              : "This election has ended. You can view the results below."}
          </AlertDescription>
        </Alert>
      )}

      {voter.hasVoted && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You have successfully voted in this election. Your vote is secure and has been recorded on the blockchain.
          </AlertDescription>
        </Alert>
      )}

      {/* Candidates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Candidates</h3>
          <span className="text-sm text-muted-foreground">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
          </span>
        </div>

        {candidates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No candidates available for this election.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onVote={handleVote}
                isVoting={isVoting}
                hasVoted={voter.hasVoted}
                votedCandidateId={voter.votedCandidateId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Voting Instructions */}
      {!voter.hasVoted && canVote && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Voting Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Review each candidate's manifesto carefully before voting</p>
            <p>• You can only vote once per election</p>
            <p>• Your vote will be recorded on the blockchain and cannot be changed</p>
            <p>• Keep your wallet connected during the voting process</p>
            <p>• Your vote is anonymous but verifiable</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
