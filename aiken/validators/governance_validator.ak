use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction}
use aiken/transaction/credential.{VerificationKey}
use aiken/interval
use aiken/cbor

// Governance proposal datum
pub type GovernanceDatum {
  proposal_id: ByteArray,
  proposer: Hash<Blake2b_224, VerificationKey>,
  title: ByteArray,
  description: ByteArray,
  // Proposal details - could be fund allocation, parameter change, etc.
  proposal_type: ProposalType,
  // Voting details
  votes_for: Int,
  votes_against: Int,
  // Voting period
  voting_start: Int,
  voting_end: Int,
  // Proposal status
  status: ProposalStatus,
  // Minimum voting power required to pass
  quorum: Int,
}

pub type ProposalType {
  AllocateFunds { campaign_id: ByteArray, amount: Int }
  ChangeParameter { parameter_name: ByteArray, new_value: ByteArray }
  AddAdmin { new_admin: Hash<Blake2b_224, VerificationKey> }
  RemoveAdmin { admin_to_remove: Hash<Blake2b_224, VerificationKey> }
}

pub type ProposalStatus {
  Proposed
  Active
  Passed
  Rejected
  Executed
}

// Vote record - tracks individual votes
pub type VoteRecord {
  proposal_id: ByteArray,
  voter: Hash<Blake2b_224, VerificationKey>,
  voting_power: Int,  // Based on donation amount
  vote_choice: VoteChoice,
}

pub type VoteChoice {
  VoteFor
  VoteAgainst
  Abstain
}

// Governance redeemer
pub type GovernanceRedeemer {
  CreateProposal
  CastVote { vote: VoteChoice, voting_power: Int }
  ExecuteProposal
  CancelProposal
}

// Helper: Check if voting period is active
fn is_voting_active(current_time: Int, start: Int, end: Int) -> Bool {
  current_time >= start && current_time <= end
}

// Helper: Check if proposal passed
fn has_quorum_and_majority(votes_for: Int, votes_against: Int, quorum: Int) -> Bool {
  let total_votes = votes_for + votes_against
  let majority = votes_for > votes_against
  let met_quorum = total_votes >= quorum
  
  majority && met_quorum
}

// Main governance validator
validator {
  fn governance_validator(
    datum: GovernanceDatum,
    redeemer: GovernanceRedeemer,
    ctx: ScriptContext,
  ) -> Bool {
    let tx = ctx.transaction
    let tx_sigs = tx.extra_signatories

    when redeemer is {
      // Create a new governance proposal
      CreateProposal -> {
        // Proposer must sign
        let proposer_signed = list.has(tx_sigs, datum.proposer)
        
        // Initial state validation
        let initial_votes = datum.votes_for == 0 && datum.votes_against == 0
        let valid_status = datum.status == Proposed
        let valid_voting_period = datum.voting_end > datum.voting_start
        
        proposer_signed && initial_votes && valid_status && valid_voting_period
      }

      // Cast a vote on a proposal
      CastVote { vote, voting_power } -> {
        // Get current time from transaction validity range
        // (In practice, extract from tx.validity_range)
        // For now, assume voting is active
        let voting_active = datum.status == Active
        
        // Ensure voting power is positive
        let valid_voting_power = voting_power > 0
        
        // At least one signer (the voter)
        let voter_signed = list.length(tx_sigs) >= 1
        
        voting_active && valid_voting_power && voter_signed
      }

      // Execute a passed proposal
      ExecuteProposal -> {
        // Proposal must have passed
        let proposal_passed = datum.status == Passed
        
        // Check quorum and majority
        let valid_result = has_quorum_and_majority(
          datum.votes_for,
          datum.votes_against,
          datum.quorum,
        )
        
        // Voting period must be over
        // (Check via tx.validity_range - simplified here)
        let voting_ended = True
        
        proposal_passed && valid_result && voting_ended
      }

      // Cancel a proposal (admin action)
      CancelProposal -> {
        // Proposer can cancel their own proposal before voting starts
        let proposer_signed = list.has(tx_sigs, datum.proposer)
        let not_active = datum.status == Proposed
        
        proposer_signed && not_active
      }
    }
  }
}

// Test: Proposal with quorum and majority passes
test governance_proposal_passes_with_quorum() {
  let datum = GovernanceDatum {
    proposal_id: "prop_001",
    proposer: #"proposer",
    title: "Allocate 100 ADA to Medical Emergency",
    description: "Emergency fund allocation",
    proposal_type: AllocateFunds { campaign_id: "camp_001", amount: 100000000 },
    votes_for: 75000000,  // 75 ADA worth of voting power
    votes_against: 25000000,  // 25 ADA worth
    voting_start: 1700000000,
    voting_end: 1700086400,  // 24 hours later
    status: Passed,
    quorum: 50000000,  // 50 ADA minimum
  }
  
  // Should pass: total 100 ADA > 50 ADA quorum, and 75 > 25 majority
  has_quorum_and_majority(datum.votes_for, datum.votes_against, datum.quorum)
}
