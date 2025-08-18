import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"

// POST /api/votes - Cast a vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { electionId, candidateId } = body

    // Validate required fields
    if (!electionId || !candidateId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Cast vote on blockchain
    const success = await blockchainService.castVote(electionId, candidateId)

    if (success) {
      return NextResponse.json({ message: "Vote cast successfully" }, { status: 201 })
    } else {
      return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error casting vote:", error)
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 })
  }
}

// GET /api/votes - Check if voter has voted
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const electionId = searchParams.get("electionId")
    const voterAddress = searchParams.get("address")

    if (!electionId || !voterAddress) {
      return NextResponse.json({ error: "Election ID and voter address are required" }, { status: 400 })
    }

    const hasVoted = await blockchainService.hasVoterVoted(Number.parseInt(electionId), voterAddress)
    return NextResponse.json({ hasVoted })
  } catch (error) {
    console.error("Error checking vote status:", error)
    return NextResponse.json({ error: "Failed to check vote status" }, { status: 500 })
  }
}
