"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, Vote } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { Election } from "@/lib/types"
import { formatTimestamp, getElectionStatus } from "@/lib/blockchain"

interface ElectionListProps {
  onElectionSelect: (election: Election) => void
}

export function ElectionList({ onElectionSelect }: ElectionListProps) {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await apiClient.getElections()
        setElections(response.elections)
      } catch (error) {
        console.error("Failed to fetch elections:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-primary text-primary-foreground"
      case "Upcoming":
        return "bg-secondary text-secondary-foreground"
      case "Ended":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (elections.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>No Elections Available</CardTitle>
          <CardDescription>There are currently no elections available.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Available Elections</h2>
      <div className="grid gap-4">
        {elections.map((election) => {
          const status = getElectionStatus(election)
          return (
            <Card key={election.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="h-5 w-5" />
                      {election.title}
                    </CardTitle>
                    <CardDescription>{election.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(status)}>{status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Start Time</p>
                      <p className="text-muted-foreground">{formatTimestamp(election.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">End Time</p>
                      <p className="text-muted-foreground">{formatTimestamp(election.endTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Total Votes</p>
                      <p className="text-muted-foreground">{election.totalVotes}</p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => onElectionSelect(election)} className="w-full">
                  {status === "Active" ? "Vote Now" : status === "Upcoming" ? "View Details" : "View Results"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
