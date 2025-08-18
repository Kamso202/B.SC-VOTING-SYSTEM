"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock } from "lucide-react"
import { apiClient } from "@/lib/api"
import type { Election } from "@/lib/types"
import { formatTimestamp, getElectionStatus } from "@/lib/blockchain"

interface ElectionSelectorProps {
  onElectionSelect: (election: Election) => void
  selectedElection: Election | null
}

export function ElectionSelector({ onElectionSelect, selectedElection }: ElectionSelectorProps) {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await apiClient.getElections()
        setElections(response.elections)

        // Auto-select the first active election
        const activeElection = response.elections.find((e) => getElectionStatus(e) === "Active")
        if (activeElection && !selectedElection) {
          onElectionSelect(activeElection)
        }
      } catch (error) {
        console.error("Failed to fetch elections:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [onElectionSelect, selectedElection])

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
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Loading Elections...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (elections.length === 0) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>No Elections Available</CardTitle>
          <CardDescription>There are currently no elections available for registration.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Select Election
        </CardTitle>
        <CardDescription>Choose an election to register for voting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedElection?.id.toString() || ""}
          onValueChange={(value) => {
            const election = elections.find((e) => e.id.toString() === value)
            if (election) onElectionSelect(election)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an election" />
          </SelectTrigger>
          <SelectContent>
            {elections.map((election) => (
              <SelectItem key={election.id} value={election.id.toString()}>
                <div className="flex items-center justify-between w-full">
                  <span>{election.title}</span>
                  <Badge className={getStatusColor(getElectionStatus(election))}>{getElectionStatus(election)}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedElection && (
          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <div>
              <h3 className="font-semibold text-lg">{selectedElection.title}</h3>
              <p className="text-muted-foreground">{selectedElection.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Start Time</p>
                  <p className="text-muted-foreground">{formatTimestamp(selectedElection.startTime)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">End Time</p>
                  <p className="text-muted-foreground">{formatTimestamp(selectedElection.endTime)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Total Votes</p>
                  <p className="text-muted-foreground">{selectedElection.totalVotes}</p>
                </div>
              </div>
            </div>

            <Badge className={getStatusColor(getElectionStatus(selectedElection))}>
              {getElectionStatus(selectedElection)}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
