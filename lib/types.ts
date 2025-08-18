// Shared types for the application
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
  percentage?: string
}

export interface Voter {
  isRegistered: boolean
  hasVoted: boolean
  studentId: string
  votedCandidateId: number
  registrationTime: number
}

export interface ElectionWithStats extends Election {
  candidateCount: number
}

export interface VoteResults {
  candidates: Candidate[]
  totalVotes: number
  electionId: number
  hasVotes: boolean
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Form types
export interface CreateElectionForm {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

export interface AddCandidateForm {
  name: string
  position: string
  manifesto: string
}

export interface VoterRegistrationForm {
  studentId: string
}

// Utility types
export type ElectionStatus = "Upcoming" | "Active" | "Ended" | "Expired"

export interface WalletConnection {
  isConnected: boolean
  address: string | null
  isConnecting: boolean
}
