// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BetGame {
    address public owner;

    enum Outcome { NONE, TEAM1, TEAM2, DRAW }

    struct Match {
        uint256 matchId;
        bool isOpen;
        bool isResolved;
        Outcome result;
        mapping(address => Outcome) votes;
        mapping(address => bool) hasVoted;
        uint256 team1Votes;
        uint256 team2Votes;
        uint256 drawVotes;
        uint256 totalVotes;
    }

    mapping(uint256 => Match) public matches;
    uint256 public matchCount;

    event MatchCreated(uint256 indexed matchId);
    event VoteCast(uint256 indexed matchId, address indexed voter, Outcome outcome);
    event MatchResolved(uint256 indexed matchId, Outcome result);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createMatch() external onlyOwner returns (uint256) {
        matchCount++;
        Match storage m = matches[matchCount];
        m.matchId = matchCount;
        m.isOpen = true;
        m.isResolved = false;
        m.result = Outcome.NONE;
        emit MatchCreated(matchCount);
        return matchCount;
    }

    function vote(uint256 matchId, Outcome outcome) external {
        Match storage m = matches[matchId];
        require(m.isOpen, "Match not open");
        require(!m.isResolved, "Match already resolved");
        require(!m.hasVoted[msg.sender], "Already voted");
        require(outcome == Outcome.TEAM1 || outcome == Outcome.TEAM2 || outcome == Outcome.DRAW, "Invalid outcome");

        m.votes[msg.sender] = outcome;
        m.hasVoted[msg.sender] = true;
        m.totalVotes++;

        if (outcome == Outcome.TEAM1) m.team1Votes++;
        else if (outcome == Outcome.TEAM2) m.team2Votes++;
        else m.drawVotes++;

        emit VoteCast(matchId, msg.sender, outcome);
    }

    function resolveMatch(uint256 matchId, Outcome result) external onlyOwner {
        Match storage m = matches[matchId];
        require(m.isOpen, "Match not open");
        require(!m.isResolved, "Already resolved");
        require(result != Outcome.NONE, "Invalid result");

        m.isResolved = true;
        m.isOpen = false;
        m.result = result;

        emit MatchResolved(matchId, result);
    }

    function getVoteStats(uint256 matchId) external view returns (
        uint256 team1, uint256 team2, uint256 draw, uint256 total
    ) {
        Match storage m = matches[matchId];
        return (m.team1Votes, m.team2Votes, m.drawVotes, m.totalVotes);
    }

    function getUserVote(uint256 matchId, address user) external view returns (Outcome, bool) {
        Match storage m = matches[matchId];
        return (m.votes[user], m.hasVoted[user]);
    }

    function getMatchResult(uint256 matchId) external view returns (Outcome) {
        return matches[matchId].result;
    }
}
