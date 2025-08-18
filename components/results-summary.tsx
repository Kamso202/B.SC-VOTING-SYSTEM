"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Percent, Clock } from "lucide-react"
import type { Candidate, Election } from "@/lib/types"
import { formatTimestamp } from "@/lib/blockchain"

interface ResultsSummaryProps {
  election: Election
  candidates: Candidate[]
  totalVotes: number
}

export function ResultsSummary({ election, candidates, totalVotes }: ResultsSummaryProps) {
  // Sort candidates by vote count to find winner
  const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount)
  const winner = sortedCandidates[0]
  const runnerUp = sortedCandidates[1]

  const winnerPercentage = totalVotes > 0 ? (((winner?.voteCount || 0) / totalVotes) * 100).toFixed(1) : "0"
  const turnoutRate = "85.2" // This would be calculated based on registered voters vs total votes

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Winner */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Winner</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{winner?.name || "TBD"}</div>
          <p className="text-xs text-muted-foreground">
            {winner ? `${winner.voteCount} votes (${winnerPercentage}%)` : "No votes yet"}
          </p>
        </CardContent>
      </Card>

      {/* Total Votes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVotes}</div>
          <p className="text-xs text-muted-foreground">Votes cast in this election</p>
        </CardContent>
      </Card>

      {/* Turnout Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Turnout Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{turnoutRate}%</div>
          <p className="text-xs text-muted-foreground">Of registered voters</p>
        </CardContent>
      </Card>

      {/* Election Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <Badge variant={election.isActive ? "default" : "secondary"}>
              {election.isActive ? "Active" : "Ended"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {election.isActive ? "Voting in progress" : `Ended ${formatTimestamp(election.endTime)}`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
