import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain"

// GET /api/voters - Get voter information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const electionId = searchParams.get("electionId")
    const voterAddress = searchParams.get("address")

    if (!electionId || !voterAddress) {
      return NextResponse.json({ error: "Election ID and voter address are required" }, { status: 400 })
    }

    try {
      const voter = await blockchainService.getVoter(Number.parseInt(electionId), voterAddress)
      if (!voter) {
        return NextResponse.json({ error: "Voter not found" }, { status: 404 })
      }
      return NextResponse.json({ voter })
    } catch (contractError: any) {
      if (contractError.message?.includes("Contract not initialized")) {
        console.log("[v0] Contract not initialized, returning mock voter data")
        // Return mock voter data for development
        const mockVoter = {
          address: voterAddress,
          isRegistered: true,
          hasVoted: false,
          studentId: "2024/001",
        }
        return NextResponse.json({ voter: mockVoter })
      }
      throw contractError
    }
  } catch (error) {
    console.error("Error fetching voter:", error)
    return NextResponse.json({ error: "Failed to fetch voter information" }, { status: 500 })
  }
}

// POST /api/voters - Register voter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { electionId, studentId } = body

    // Validate required fields
    if (!electionId || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate student ID format (basic validation)
    const studentIdRegex = /^\d{4}\/\d{3}$/
    if (!studentIdRegex.test(studentId)) {
      return NextResponse.json({ error: "Invalid student ID format. Use format: YYYY/XXX" }, { status: 400 })
    }

    try {
      const success = await blockchainService.registerVoter(electionId, studentId)
      if (success) {
        return NextResponse.json({ message: "Voter registered successfully" }, { status: 201 })
      } else {
        return NextResponse.json({ error: "Failed to register voter" }, { status: 500 })
      }
    } catch (contractError: any) {
      if (contractError.message?.includes("Contract not initialized")) {
        console.log("[v0] Contract not initialized, simulating voter registration")
        // Simulate successful registration for development
        return NextResponse.json({ message: "Voter registered successfully (development mode)" }, { status: 201 })
      }
      throw contractError
    }
  } catch (error) {
    console.error("Error registering voter:", error)
    return NextResponse.json({ error: "Failed to register voter" }, { status: 500 })
  }
}
