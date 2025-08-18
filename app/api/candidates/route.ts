import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"

// GET /api/candidates - Get candidates for an election
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const electionId = searchParams.get("electionId")

    if (!electionId) {
      return NextResponse.json({ error: "Election ID is required" }, { status: 400 })
    }

    const candidates = await blockchainService.getAllCandidates(Number.parseInt(electionId))
    return NextResponse.json({ candidates })
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 })
  }
}

// POST /api/candidates - Add new candidate (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { electionId, name, position, manifesto } = body

    // Validate required fields
    if (!electionId || !name || !position || !manifesto) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Add candidate to blockchain
    const success = await blockchainService.addCandidate(electionId, name, position, manifesto)

    if (success) {
      // Get updated candidates list
      const candidates = await blockchainService.getAllCandidates(electionId)
      const newCandidate = candidates[candidates.length - 1] // Get the last added candidate
      return NextResponse.json({ candidate: newCandidate }, { status: 201 })
    } else {
      return NextResponse.json({ error: "Failed to add candidate" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error adding candidate:", error)
    return NextResponse.json({ error: "Failed to add candidate" }, { status: 500 })
  }
}
