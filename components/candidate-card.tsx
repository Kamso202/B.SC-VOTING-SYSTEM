"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, FileText, CheckCircle } from "lucide-react"
import type { Candidate } from "@/lib/types"

interface CandidateCardProps {
  candidate: Candidate
  onVote: (candidateId: number) => void
  isVoting: boolean
  hasVoted: boolean
  votedCandidateId?: number
  showResults?: boolean
}

export function CandidateCard({
  candidate,
  onVote,
  isVoting,
  hasVoted,
  votedCandidateId,
  showResults = false,
}: CandidateCardProps) {
  const isSelected = votedCandidateId === candidate.id
  const canVote = !hasVoted && !isVoting

  return (
    <Card className={`relative transition-all ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}`}>
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle className="h-4 w-4" />
          </div>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{candidate.name}</CardTitle>
              <CardDescription className="font-medium">{candidate.position}</CardDescription>
            </div>
          </div>
          {showResults && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{candidate.voteCount}</div>
              <div className="text-sm text-muted-foreground">{candidate.percentage}% of votes</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Manifesto</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{candidate.manifesto}</p>
        </div>

        {showResults && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Vote Progress</span>
              <span>{candidate.percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${candidate.percentage}%` }}
              />
            </div>
          </div>
        )}

        {!showResults && (
          <div className="pt-2">
            {hasVoted ? (
              <div className="flex items-center justify-center gap-2 py-2">
                {isSelected ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">You voted for this candidate</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">You have already voted</span>
                )}
              </div>
            ) : (
              <Button onClick={() => onVote(candidate.id)} disabled={!canVote} className="w-full" size="lg">
                {isVoting ? "Casting Vote..." : "Vote for this Candidate"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
