"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import type { Candidate } from "@/lib/types"

interface ResultsTableProps {
  candidates: Candidate[]
  totalVotes: number
}

export function ResultsTable({ candidates, totalVotes }: ResultsTableProps) {
  // Sort candidates by vote count (descending)
  const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount)

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return (
          <div className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
            {index + 1}
          </div>
        )
    }
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-yellow-500 text-yellow-50">1st Place</Badge>
      case 1:
        return <Badge variant="secondary">2nd Place</Badge>
      case 2:
        return <Badge variant="outline">3rd Place</Badge>
      default:
        return <Badge variant="outline">{index + 1}th Place</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Results</CardTitle>
        <CardDescription>Complete ranking of all candidates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCandidates.map((candidate, index) => {
            const percentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : "0"

            return (
              <div
                key={candidate.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  index === 0
                    ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  {getRankIcon(index)}
                  <div>
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.position}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{candidate.voteCount}</div>
                    <div className="text-sm text-muted-foreground">{percentage}% of votes</div>
                  </div>
                  {getRankBadge(index)}
                </div>
              </div>
            )
          })}
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No candidates found for this election.</div>
        )}
      </CardContent>
    </Card>
  )
}
