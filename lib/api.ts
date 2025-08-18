// API client for frontend to interact with backend
export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Election methods
  async getElections() {
    return this.request<{ elections: any[] }>("/elections")
  }

  async getElection(id: number) {
    return this.request<{ election: any }>(`/elections?id=${id}`)
  }

  async createElection(data: { title: string; description: string; startTime: number; endTime: number }) {
    return this.request<{ election: any }>("/elections", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Candidate methods
  async getCandidates(electionId: number) {
    return this.request<{ candidates: any[] }>(`/candidates?electionId=${electionId}`)
  }

  async addCandidate(data: { electionId: number; name: string; position: string; manifesto: string }) {
    return this.request<{ candidate: any }>("/candidates", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Voter methods
  async getVoter(electionId: number, address: string) {
    return this.request<{ voter: any }>(`/voters?electionId=${electionId}&address=${address}`)
  }

  async registerVoter(data: { electionId: number; studentId: string }) {
    return this.request<{ message: string }>("/voters", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Vote methods
  async castVote(data: { electionId: number; candidateId: number }) {
    return this.request<{ message: string }>("/votes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async checkVoteStatus(electionId: number, address: string) {
    return this.request<{ hasVoted: boolean }>(`/votes?electionId=${electionId}&address=${address}`)
  }

  // Results methods
  async getResults(electionId: number) {
    return this.request<{ candidates: any[]; totalVotes: number; electionId: number }>(
      `/results?electionId=${electionId}`,
    )
  }

  // Admin methods
  async endElection(electionId: number) {
    return this.request<{ message: string }>("/admin", {
      method: "POST",
      body: JSON.stringify({ action: "end-election", electionId }),
    })
  }

  async getAdminStats() {
    return this.request<{ totalElections: number; elections: any[] }>("/admin/stats")
  }
}

export const apiClient = new ApiClient()
