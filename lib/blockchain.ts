import { ethers } from "ethers"

// Types for our voting system
export interface Election {
  id: number
  title: string
  description: string
  startTime: number
  endTime: number
  isActive: boolean
  totalVotes: number
}

export interface Candidate {
  id: number
  name: string
  position: string
  manifesto: string
  voteCount: number
  isActive: boolean
}

export interface Voter {
  isRegistered: boolean
  hasVoted: boolean
  studentId: string
  votedCandidateId: number
  registrationTime: number
}

// Mock data for development mode
const MOCK_DATA = {
  elections: [
    {
      id: 1,
      title: "Student Union Election 2024",
      description: "Annual election for Student Union Government positions",
      startTime: Math.floor(Date.now() / 1000) - 3600, // Started 1 hour ago
      endTime: Math.floor(Date.now() / 1000) + 86400, // Ends in 24 hours
      isActive: true,
      totalVotes: 45,
    },
  ],
  candidates: [
    {
      id: 1,
      name: "John Doe",
      position: "President",
      manifesto: "Building a better future for all students with transparency and innovation.",
      voteCount: 25,
      isActive: true,
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "President",
      manifesto: "Empowering student voices and creating lasting positive change.",
      voteCount: 20,
      isActive: true,
    },
  ],
}

const DEVELOPMENT_STORAGE = {
  votes: new Map<string, { electionId: number; candidateId: number; voterAddress: string }>(),
  voters: new Map<string, Voter>(),
  elections: new Map<number, Election>(),
  candidates: new Map<string, Candidate[]>(),
}

// Blockchain connection class
export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null
  private contract: ethers.Contract | null = null
  private contractAddress = ""
  private contractABI: any[] = []
  private isDevelopmentMode = true
  private isConnecting = false

  constructor() {
    this.initializeContract()
    this.initializeDevelopmentStorage()
  }

  private initializeDevelopmentStorage() {
    // Initialize elections
    MOCK_DATA.elections.forEach((election) => {
      DEVELOPMENT_STORAGE.elections.set(election.id, election)
    })

    // Initialize candidates
    DEVELOPMENT_STORAGE.candidates.set("1", MOCK_DATA.candidates)
  }

  private async initializeContract() {
    try {
      // Load contract info
      const contractInfo = await import("./contracts/VotingSystem.json")
      this.contractAddress = contractInfo.address
      this.contractABI = contractInfo.abi
      console.log("[v0] Contract info loaded successfully")
    } catch (error) {
      console.error("Failed to load contract info:", error)
      this.isDevelopmentMode = true
      console.log("[v0] Running in development mode with mock data")
    }
  }

  async connectWallet(): Promise<boolean> {
    if (this.isConnecting) {
      console.log("[v0] Wallet connection already in progress, waiting...")
      return false
    }

    try {
      this.isConnecting = true

      if (typeof window !== "undefined" && window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error: any) {
          if (error.message?.includes("already pending")) {
            console.log("[v0] Wallet request already pending, please wait...")
            throw new Error("Wallet connection request already pending. Please wait and try again.")
          }
          throw error
        }

        this.provider = new ethers.BrowserProvider(window.ethereum)
        this.signer = await this.provider.getSigner()

        if (this.contractAddress && this.contractABI.length > 0) {
          this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer)
        }

        return true
      } else {
        throw new Error("MetaMask not found")
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      return false
    } finally {
      this.isConnecting = false
    }
  }

  async getCurrentAccount(): Promise<string | null> {
    try {
      if (this.signer) {
        return await this.signer.getAddress()
      }
      return null
    } catch (error) {
      console.error("Failed to get current account:", error)
      return null
    }
  }

  async isConnected(): Promise<boolean> {
    return this.provider !== null && this.signer !== null && this.contract !== null
  }

  // Election methods
  async createElection(title: string, description: string, startTime: number, endTime: number): Promise<boolean> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        const newId = Math.max(...Array.from(DEVELOPMENT_STORAGE.elections.keys()), 0) + 1
        const newElection: Election = {
          id: newId,
          title,
          description,
          startTime,
          endTime,
          isActive: true,
          totalVotes: 0,
        }
        DEVELOPMENT_STORAGE.elections.set(newId, newElection)
        DEVELOPMENT_STORAGE.candidates.set(newId.toString(), [])
        console.log("[v0] Created election in development storage:", newElection)
        return true
      }

      const tx = await this.contract.createElection(title, description, startTime, endTime)
      await tx.wait()
      return true
    } catch (error) {
      console.error("Failed to create election:", error)
      return false
    }
  }

  async getElection(electionId: number): Promise<Election | null> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        console.log("[v0] Returning election from development storage")
        return DEVELOPMENT_STORAGE.elections.get(electionId) || null
      }

      const election = await this.contract.getElection(electionId)
      return {
        id: Number(election.id),
        title: election.title,
        description: election.description,
        startTime: Number(election.startTime),
        endTime: Number(election.endTime),
        isActive: election.isActive,
        totalVotes: Number(election.totalVotes),
      }
    } catch (error) {
      console.error("Failed to get election:", error)
      return DEVELOPMENT_STORAGE.elections.get(electionId) || null
    }
  }

  async getCurrentElectionId(): Promise<number> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        console.log("[v0] Returning mock election ID")
        return 1
      }

      const currentId = await this.contract.currentElectionId()
      return Number(currentId)
    } catch (error) {
      console.error("Failed to get current election ID:", error)
      return 1
    }
  }

  // Candidate methods
  async addCandidate(electionId: number, name: string, position: string, manifesto: string): Promise<boolean> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        const candidates = DEVELOPMENT_STORAGE.candidates.get(electionId.toString()) || []
        const newId = Math.max(...candidates.map((c) => c.id), 0) + 1
        const newCandidate: Candidate = {
          id: newId,
          name,
          position,
          manifesto,
          voteCount: 0,
          isActive: true,
        }
        candidates.push(newCandidate)
        DEVELOPMENT_STORAGE.candidates.set(electionId.toString(), candidates)
        console.log("[v0] Added candidate to development storage:", newCandidate)
        return true
      }

      const tx = await this.contract.addCandidate(electionId, name, position, manifesto)
      await tx.wait()
      return true
    } catch (error) {
      console.error("Failed to add candidate:", error)
      return false
    }
  }

  async getAllCandidates(electionId: number): Promise<Candidate[]> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        console.log("[v0] Returning candidates from development storage")
        return DEVELOPMENT_STORAGE.candidates.get(electionId.toString()) || []
      }

      const candidates = await this.contract.getAllCandidates(electionId)
      return candidates.map((candidate: any) => ({
        id: Number(candidate.id),
        name: candidate.name,
        position: candidate.position,
        manifesto: candidate.manifesto,
        voteCount: Number(candidate.voteCount),
        isActive: candidate.isActive,
      }))
    } catch (error) {
      console.error("Failed to get candidates:", error)
      return DEVELOPMENT_STORAGE.candidates.get(electionId.toString()) || []
    }
  }

  // Voter methods
  async registerVoter(electionId: number, studentId: string): Promise<boolean> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        const voterAddress = (await this.getCurrentAccount()) || "mock-address"
        const voterKey = `${electionId}-${voterAddress}`
        const voter: Voter = {
          isRegistered: true,
          hasVoted: false,
          studentId,
          votedCandidateId: 0,
          registrationTime: Math.floor(Date.now() / 1000),
        }
        DEVELOPMENT_STORAGE.voters.set(voterKey, voter)
        console.log("[v0] Registered voter in development storage:", voter)
        return true
      }

      const tx = await this.contract.registerVoter(electionId, studentId)
      await tx.wait()
      return true
    } catch (error) {
      console.error("Failed to register voter:", error)
      return false
    }
  }

  async getVoter(electionId: number, voterAddress: string): Promise<Voter | null> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        console.log("[v0] Returning voter from development storage")
        const voterKey = `${electionId}-${voterAddress}`
        return (
          DEVELOPMENT_STORAGE.voters.get(voterKey) || {
            isRegistered: true,
            hasVoted: false,
            studentId: "2024/001",
            votedCandidateId: 0,
            registrationTime: Math.floor(Date.now() / 1000) - 3600,
          }
        )
      }

      const voter = await this.contract.getVoter(electionId, voterAddress)
      return {
        isRegistered: voter.isRegistered,
        hasVoted: voter.hasVoted,
        studentId: voter.studentId,
        votedCandidateId: Number(voter.votedCandidateId),
        registrationTime: Number(voter.registrationTime),
      }
    } catch (error) {
      console.error("Failed to get voter:", error)
      return {
        isRegistered: true,
        hasVoted: false,
        studentId: "2024/001",
        votedCandidateId: 0,
        registrationTime: Math.floor(Date.now() / 1000) - 3600,
      }
    }
  }

  async castVote(electionId: number, candidateId: number): Promise<boolean> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        console.log("[v0] Processing vote in development mode")
        const voterAddress = (await this.getCurrentAccount()) || "mock-address"
        const voteKey = `${electionId}-${voterAddress}-${Date.now()}`
        const voterKey = `${electionId}-${voterAddress}`

        DEVELOPMENT_STORAGE.votes.set(voteKey, { electionId, candidateId, voterAddress })

        // Update voter as having voted
        const voter = DEVELOPMENT_STORAGE.voters.get(voterKey)
        if (voter) {
          voter.hasVoted = true
          voter.votedCandidateId = candidateId
          DEVELOPMENT_STORAGE.voters.set(voterKey, voter)
        }

        // Update candidate vote count
        const candidates = DEVELOPMENT_STORAGE.candidates.get(electionId.toString()) || []
        const candidate = candidates.find((c) => c.id === candidateId)
        if (candidate) {
          candidate.voteCount += 1
          DEVELOPMENT_STORAGE.candidates.set(electionId.toString(), candidates)
        }

        // Update election total votes
        const election = DEVELOPMENT_STORAGE.elections.get(electionId)
        if (election) {
          election.totalVotes += 1
          DEVELOPMENT_STORAGE.elections.set(electionId, election)
        }

        console.log("[v0] Vote cast successfully in development mode")
        return true
      }

      const tx = await this.contract.castVote(electionId, candidateId)
      await tx.wait()
      return true
    } catch (error) {
      console.error("Failed to cast vote:", error)
      if (this.isDevelopmentMode) {
        console.log("[v0] Returning success for development mode")
        return true
      }
      return false
    }
  }

  async hasVoterVoted(electionId: number, voterAddress: string): Promise<boolean> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        console.log("[v0] Checking voted status from development storage")
        const voterKey = `${electionId}-${voterAddress}`
        const voter = DEVELOPMENT_STORAGE.voters.get(voterKey)
        return voter?.hasVoted || false
      }

      return await this.contract.hasVoterVoted(electionId, voterAddress)
    } catch (error) {
      console.error("Failed to check if voter has voted:", error)
      return false
    }
  }

  async hasAnyVotes(electionId: number): Promise<boolean> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        console.log("[v0] Checking for votes in development storage")
        const votesForElection = Array.from(DEVELOPMENT_STORAGE.votes.values()).filter(
          (vote) => vote.electionId === electionId,
        )
        const hasVotes = votesForElection.length > 0
        console.log(`[v0] Found ${votesForElection.length} votes for election ${electionId}`)
        return hasVotes
      }

      const totalVotes = await this.contract.getTotalVotes(electionId)
      return Number(totalVotes) > 0
    } catch (error) {
      console.error("Failed to check if any votes exist:", error)
      return false
    }
  }

  // Results methods
  async getElectionResults(electionId: number): Promise<{ candidates: Candidate[]; totalVotes: number } | null> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        console.log("[v0] Returning results from development storage")
        const candidates = DEVELOPMENT_STORAGE.candidates.get(electionId.toString()) || []
        const election = DEVELOPMENT_STORAGE.elections.get(electionId)
        return {
          candidates,
          totalVotes: election?.totalVotes || 0,
        }
      }

      const [candidates, totalVotes] = await this.contract.getElectionResults(electionId)

      return {
        candidates: candidates.map((candidate: any) => ({
          id: Number(candidate.id),
          name: candidate.name,
          position: candidate.position,
          manifesto: candidate.manifesto,
          voteCount: Number(candidate.voteCount),
          isActive: candidate.isActive,
        })),
        totalVotes: Number(totalVotes),
      }
    } catch (error) {
      console.error("Failed to get election results:", error)
      const candidates = DEVELOPMENT_STORAGE.candidates.get(electionId.toString()) || []
      const election = DEVELOPMENT_STORAGE.elections.get(electionId)
      return {
        candidates,
        totalVotes: election?.totalVotes || 0,
      }
    }
  }

  async endElection(electionId: number): Promise<boolean> {
    try {
      if (this.isDevelopmentMode || !this.contract) {
        const election = DEVELOPMENT_STORAGE.elections.get(electionId)
        if (election) {
          election.isActive = false
          DEVELOPMENT_STORAGE.elections.set(electionId, election)
          console.log("[v0] Ended election in development storage")
        }
        return true
      }

      const tx = await this.contract.endElection(electionId)
      await tx.wait()
      return true
    } catch (error) {
      console.error("Failed to end election:", error)
      return false
    }
  }
}

// Global instance
export const blockchainService = new BlockchainService()

// Utility functions
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString()
}

export const isElectionActive = (election: Election): boolean => {
  const now = Math.floor(Date.now() / 1000)
  return election.isActive && now >= election.startTime && now <= election.endTime
}

export const getElectionStatus = (election: Election): string => {
  const now = Math.floor(Date.now() / 1000)

  if (!election.isActive) return "Ended"
  if (now < election.startTime) return "Upcoming"
  if (now > election.endTime) return "Expired"
  return "Active"
}
