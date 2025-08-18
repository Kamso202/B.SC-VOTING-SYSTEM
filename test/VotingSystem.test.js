const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("VotingSystem", () => {
  let VotingSystem
  let votingSystem
  let admin
  let voter1
  let voter2
  let voter3

  beforeEach(async () => {
    // Get signers
    ;[admin, voter1, voter2, voter3] = await ethers.getSigners()

    // Deploy contract
    VotingSystem = await ethers.getContractFactory("VotingSystem")
    votingSystem = await VotingSystem.deploy()
    await votingSystem.waitForDeployment()
  })

  describe("Election Management", () => {
    it("Should create a new election", async () => {
      const title = "Student Union Election 2024"
      const description = "Annual student union election"
      const startTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const endTime = startTime + 86400 // 24 hours later

      await votingSystem.createElection(title, description, startTime, endTime)

      const election = await votingSystem.getElection(1)
      expect(election.title).to.equal(title)
      expect(election.description).to.equal(description)
      expect(election.isActive).to.be.true
    })

    it("Should add candidates to election", async () => {
      // Create election first
      const startTime = Math.floor(Date.now() / 1000) + 3600
      const endTime = startTime + 86400
      await votingSystem.createElection("Test Election", "Test", startTime, endTime)

      // Add candidate
      await votingSystem.addCandidate(1, "John Doe", "President", "Make campus better")

      const candidate = await votingSystem.getCandidate(1, 1)
      expect(candidate.name).to.equal("John Doe")
      expect(candidate.position).to.equal("President")
      expect(candidate.voteCount).to.equal(0)
    })
  })

  describe("Voter Registration", () => {
    beforeEach(async () => {
      const startTime = Math.floor(Date.now() / 1000) + 3600
      const endTime = startTime + 86400
      await votingSystem.createElection("Test Election", "Test", startTime, endTime)
    })

    it("Should register a voter", async () => {
      await votingSystem.connect(voter1).registerVoter(1, "2020/001")

      const voter = await votingSystem.getVoter(1, voter1.address)
      expect(voter.isRegistered).to.be.true
      expect(voter.studentId).to.equal("2020/001")
      expect(voter.hasVoted).to.be.false
    })

    it("Should not allow duplicate student ID registration", async () => {
      await votingSystem.connect(voter1).registerVoter(1, "2020/001")

      await expect(votingSystem.connect(voter2).registerVoter(1, "2020/001")).to.be.revertedWith(
        "Student ID already registered",
      )
    })
  })

  describe("Voting Process", () => {
    beforeEach(async () => {
      // Create election that starts now
      const startTime = Math.floor(Date.now() / 1000) - 60 // Started 1 minute ago
      const endTime = startTime + 86400
      await votingSystem.createElection("Test Election", "Test", startTime, endTime)

      // Add candidates
      await votingSystem.addCandidate(1, "John Doe", "President", "Manifesto 1")
      await votingSystem.addCandidate(1, "Jane Smith", "President", "Manifesto 2")

      // Register voters
      await votingSystem.connect(voter1).registerVoter(1, "2020/001")
      await votingSystem.connect(voter2).registerVoter(1, "2020/002")
    })

    it("Should allow registered voter to cast vote", async () => {
      await votingSystem.connect(voter1).castVote(1, 1)

      const voter = await votingSystem.getVoter(1, voter1.address)
      expect(voter.hasVoted).to.be.true
      expect(voter.votedCandidateId).to.equal(1)

      const candidate = await votingSystem.getCandidate(1, 1)
      expect(candidate.voteCount).to.equal(1)
    })

    it("Should not allow double voting", async () => {
      await votingSystem.connect(voter1).castVote(1, 1)

      await expect(votingSystem.connect(voter1).castVote(1, 2)).to.be.revertedWith("Voter has already voted")
    })

    it("Should not allow unregistered voter to vote", async () => {
      await expect(votingSystem.connect(voter3).castVote(1, 1)).to.be.revertedWith(
        "Voter is not registered for this election",
      )
    })
  })

  describe("Results", () => {
    beforeEach(async () => {
      const startTime = Math.floor(Date.now() / 1000) - 60
      const endTime = startTime + 86400
      await votingSystem.createElection("Test Election", "Test", startTime, endTime)

      await votingSystem.addCandidate(1, "John Doe", "President", "Manifesto 1")
      await votingSystem.addCandidate(1, "Jane Smith", "President", "Manifesto 2")

      await votingSystem.connect(voter1).registerVoter(1, "2020/001")
      await votingSystem.connect(voter2).registerVoter(1, "2020/002")

      await votingSystem.connect(voter1).castVote(1, 1)
      await votingSystem.connect(voter2).castVote(1, 1)
    })

    it("Should return correct election results", async () => {
      const [candidates, totalVotes] = await votingSystem.getElectionResults(1)

      expect(totalVotes).to.equal(2)
      expect(candidates[0].voteCount).to.equal(2)
      expect(candidates[1].voteCount).to.equal(0)
    })
  })
})
