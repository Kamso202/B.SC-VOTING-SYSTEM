// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VotingSystem
 * @dev Main contract for blockchain-based university voting system
 * @author UNIZIK Blockchain Voting System
 */
contract VotingSystem {
    // Struct to represent a candidate
    struct Candidate {
        uint256 id;
        string name;
        string position;
        string manifesto;
        uint256 voteCount;
        bool isActive;
    }
    
    // Struct to represent a voter
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        string studentId;
        uint256 votedCandidateId;
        uint256 registrationTime;
    }
    
    // Struct to represent an election
    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 totalVotes;
    }
    
    // State variables
    address public admin;
    uint256 public currentElectionId;
    
    // Mappings
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates; // electionId => candidateId => Candidate
    mapping(uint256 => mapping(address => Voter)) public voters; // electionId => voterAddress => Voter
    mapping(uint256 => uint256) public electionCandidateCount; // electionId => candidateCount
    mapping(string => address) public studentIdToAddress; // studentId => address
    
    // Events
    event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name, string position);
    event VoterRegistered(uint256 indexed electionId, address indexed voter, string studentId);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 indexed candidateId);
    event ElectionEnded(uint256 indexed electionId, uint256 totalVotes);
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier electionExists(uint256 _electionId) {
        require(_electionId <= currentElectionId && elections[_electionId].id != 0, "Election does not exist");
        _;
    }
    
    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        require(block.timestamp >= elections[_electionId].startTime, "Election has not started yet");
        require(block.timestamp <= elections[_electionId].endTime, "Election has ended");
        _;
    }
    
    modifier voterRegistered(uint256 _electionId) {
        require(voters[_electionId][msg.sender].isRegistered, "Voter is not registered for this election");
        _;
    }
    
    modifier hasNotVoted(uint256 _electionId) {
        require(!voters[_electionId][msg.sender].hasVoted, "Voter has already voted");
        _;
    }
    
    // Constructor
    constructor() {
        admin = msg.sender;
        currentElectionId = 0;
    }
    
    /**
     * @dev Create a new election
     * @param _title Title of the election
     * @param _description Description of the election
     * @param _startTime Start time of the election (Unix timestamp)
     * @param _endTime End time of the election (Unix timestamp)
     */
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) public onlyAdmin {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        
        currentElectionId++;
        
        elections[currentElectionId] = Election({
            id: currentElectionId,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            totalVotes: 0
        });
        
        emit ElectionCreated(currentElectionId, _title, _startTime, _endTime);
    }
    
    /**
     * @dev Add a candidate to an election
     * @param _electionId ID of the election
     * @param _name Name of the candidate
     * @param _position Position the candidate is running for
     * @param _manifesto Candidate's manifesto
     */
    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _position,
        string memory _manifesto
    ) public onlyAdmin electionExists(_electionId) {
        require(block.timestamp < elections[_electionId].startTime, "Cannot add candidates after election starts");
        
        electionCandidateCount[_electionId]++;
        uint256 candidateId = electionCandidateCount[_electionId];
        
        candidates[_electionId][candidateId] = Candidate({
            id: candidateId,
            name: _name,
            position: _position,
            manifesto: _manifesto,
            voteCount: 0,
            isActive: true
        });
        
        emit CandidateAdded(_electionId, candidateId, _name, _position);
    }
    
    /**
     * @dev Register a voter for an election
     * @param _electionId ID of the election
     * @param _studentId Student ID of the voter
     */
    function registerVoter(uint256 _electionId, string memory _studentId) 
        public 
        electionExists(_electionId) 
    {
        require(!voters[_electionId][msg.sender].isRegistered, "Voter already registered for this election");
        require(studentIdToAddress[_studentId] == address(0), "Student ID already registered");
        require(block.timestamp < elections[_electionId].endTime, "Registration closed");
        
        voters[_electionId][msg.sender] = Voter({
            isRegistered: true,
            hasVoted: false,
            studentId: _studentId,
            votedCandidateId: 0,
            registrationTime: block.timestamp
        });
        
        studentIdToAddress[_studentId] = msg.sender;
        
        emit VoterRegistered(_electionId, msg.sender, _studentId);
    }
    
    /**
     * @dev Cast a vote for a candidate
     * @param _electionId ID of the election
     * @param _candidateId ID of the candidate to vote for
     */
    function castVote(uint256 _electionId, uint256 _candidateId) 
        public 
        electionExists(_electionId)
        electionActive(_electionId)
        voterRegistered(_electionId)
        hasNotVoted(_electionId)
    {
        require(_candidateId > 0 && _candidateId <= electionCandidateCount[_electionId], "Invalid candidate ID");
        require(candidates[_electionId][_candidateId].isActive, "Candidate is not active");
        
        // Record the vote
        voters[_electionId][msg.sender].hasVoted = true;
        voters[_electionId][msg.sender].votedCandidateId = _candidateId;
        
        // Increment candidate vote count
        candidates[_electionId][_candidateId].voteCount++;
        
        // Increment total votes for election
        elections[_electionId].totalVotes++;
        
        emit VoteCast(_electionId, msg.sender, _candidateId);
    }
    
    /**
     * @dev End an election (only admin)
     * @param _electionId ID of the election to end
     */
    function endElection(uint256 _electionId) 
        public 
        onlyAdmin 
        electionExists(_electionId) 
    {
        require(elections[_electionId].isActive, "Election is already ended");
        
        elections[_electionId].isActive = false;
        
        emit ElectionEnded(_electionId, elections[_electionId].totalVotes);
    }
    
    /**
     * @dev Get election details
     * @param _electionId ID of the election
     */
    function getElection(uint256 _electionId) 
        public 
        view 
        electionExists(_electionId) 
        returns (Election memory) 
    {
        return elections[_electionId];
    }
    
    /**
     * @dev Get candidate details
     * @param _electionId ID of the election
     * @param _candidateId ID of the candidate
     */
    function getCandidate(uint256 _electionId, uint256 _candidateId) 
        public 
        view 
        electionExists(_electionId) 
        returns (Candidate memory) 
    {
        require(_candidateId > 0 && _candidateId <= electionCandidateCount[_electionId], "Invalid candidate ID");
        return candidates[_electionId][_candidateId];
    }
    
    /**
     * @dev Get all candidates for an election
     * @param _electionId ID of the election
     */
    function getAllCandidates(uint256 _electionId) 
        public 
        view 
        electionExists(_electionId) 
        returns (Candidate[] memory) 
    {
        uint256 candidateCount = electionCandidateCount[_electionId];
        Candidate[] memory allCandidates = new Candidate[](candidateCount);
        
        for (uint256 i = 1; i <= candidateCount; i++) {
            allCandidates[i - 1] = candidates[_electionId][i];
        }
        
        return allCandidates;
    }
    
    /**
     * @dev Get voter details
     * @param _electionId ID of the election
     * @param _voterAddress Address of the voter
     */
    function getVoter(uint256 _electionId, address _voterAddress) 
        public 
        view 
        electionExists(_electionId) 
        returns (Voter memory) 
    {
        return voters[_electionId][_voterAddress];
    }
    
    /**
     * @dev Check if voter has voted
     * @param _electionId ID of the election
     * @param _voterAddress Address of the voter
     */
    function hasVoterVoted(uint256 _electionId, address _voterAddress) 
        public 
        view 
        electionExists(_electionId) 
        returns (bool) 
    {
        return voters[_electionId][_voterAddress].hasVoted;
    }
    
    /**
     * @dev Get election results
     * @param _electionId ID of the election
     */
    function getElectionResults(uint256 _electionId) 
        public 
        view 
        electionExists(_electionId) 
        returns (Candidate[] memory, uint256) 
    {
        return (getAllCandidates(_electionId), elections[_electionId].totalVotes);
    }
}
