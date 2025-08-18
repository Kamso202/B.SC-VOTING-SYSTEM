import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"

// POST /api/admin/end-election - End an election (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { electionId, action } = body

    if (action === "end-election") {
      if (!electionId) {
        return NextResponse.json({ error: "Election ID is required" }, { status: 400 })
      }

      const success = await blockchainService.endElection(electionId)

      if (success) {
        return NextResponse.json({ message: "Election ended successfully" })
      } else {
        return NextResponse.json({ error: "Failed to end election" }, { status: 500 })
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in admin action:", error)
    return NextResponse.json({ error: "Failed to perform admin action" }, { status: 500 })
  }
}

// GET /api/admin/stats - Get system statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const currentElectionId = await blockchainService.getCurrentElectionId()
    const elections = []

    // Get all elections with basic stats
    for (let i = 1; i <= currentElectionId; i++) {
      const election = await blockchainService.getElection(i)
      if (election) {
        const candidates = await blockchainService.getAllCandidates(i)
        elections.push({
          ...election,
          candidateCount: candidates.length,
        })
      }
    }

    return NextResponse.json({
      totalElections: currentElectionId,
      elections,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
