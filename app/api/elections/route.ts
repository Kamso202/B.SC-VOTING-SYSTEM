import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"

// GET /api/elections - Get all elections or specific election
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const electionId = searchParams.get("id")

    if (electionId) {
      // Get specific election
      const election = await blockchainService.getElection(Number.parseInt(electionId))
      if (!election) {
        return NextResponse.json({ error: "Election not found" }, { status: 404 })
      }
      return NextResponse.json({ election })
    } else {
      try {
        // Get current election ID to fetch all elections
        const currentElectionId = await blockchainService.getCurrentElectionId()
        const elections = []

        for (let i = 1; i <= currentElectionId; i++) {
          const election = await blockchainService.getElection(i)
          if (election) {
            elections.push(election)
          }
        }

        return NextResponse.json({ elections })
      } catch (contractError) {
        console.error("Contract error, returning empty elections:", contractError)
        // Return empty array if contract is not initialized
        return NextResponse.json({ elections: [] })
      }
    }
  } catch (error) {
    console.error("Error fetching elections:", error)
    return NextResponse.json({ elections: [] })
  }
}

// POST /api/elections - Create new election (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, startTime, endTime } = body

    // Validate required fields
    if (!title || !description || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate timestamps
    const now = Math.floor(Date.now() / 1000)
    if (startTime <= now) {
      return NextResponse.json({ error: "Start time must be in the future" }, { status: 400 })
    }
    if (endTime <= startTime) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
    }

    // Create election on blockchain
    const success = await blockchainService.createElection(title, description, startTime, endTime)

    if (success) {
      const currentElectionId = await blockchainService.getCurrentElectionId()
      const election = await blockchainService.getElection(currentElectionId)
      return NextResponse.json({ election }, { status: 201 })
    } else {
      return NextResponse.json({ error: "Failed to create election" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating election:", error)
    return NextResponse.json({ error: "Failed to create election" }, { status: 500 })
  }
}
