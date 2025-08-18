import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"

// GET /api/results - Get election results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const electionId = searchParams.get("electionId")

    if (!electionId) {
      return NextResponse.json({ error: "Election ID is required" }, { status: 400 })
    }

    const hasVotes = await blockchainService.hasAnyVotes(Number.parseInt(electionId))

    if (!hasVotes) {
      return NextResponse.json({
        candidates: [],
        totalVotes: 0,
        electionId: Number.parseInt(electionId),
        hasVotes: false,
      })
    }

    const results = await blockchainService.getElectionResults(Number.parseInt(electionId))
    if (!results) {
      return NextResponse.json({ error: "Results not found" }, { status: 404 })
    }

    // Calculate percentages and sort candidates by vote count
    const totalVotes = results.totalVotes
    const candidatesWithPercentages = results.candidates.map((candidate) => ({
      ...candidate,
      percentage: totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(2) : "0.00",
    }))

    // Sort by vote count (descending)
    candidatesWithPercentages.sort((a, b) => b.voteCount - a.voteCount)

    return NextResponse.json({
      candidates: candidatesWithPercentages,
      totalVotes,
      electionId: Number.parseInt(electionId),
      hasVotes: true,
    })
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
