use cardano/transaction.{OutputReference, Transaction}
use aiken/collection/list

pub type VerificationKeyHash = ByteArray

pub type GovernanceDatum {
  proposal_id: ByteArray,
  proposer: VerificationKeyHash,
  title: ByteArray,
  description: ByteArray,
  proposal_type: ProposalType,
  votes_for: Int,
  votes_against: Int,
  voting_start: Int,
  voting_end: Int,
  status: ProposalStatus,
  quorum: Int,
}

pub type ProposalType {
  AllocateFunds { campaign_id: ByteArray, amount: Int }
  ChangeParameter { parameter_name: ByteArray, new_value: ByteArray }
  AddAdmin { new_admin: VerificationKeyHash }
  RemoveAdmin { admin_to_remove: VerificationKeyHash }
}

pub type ProposalStatus {
  Proposed
  Active
  Passed
  Rejected
  Executed
}

pub type GovernanceRedeemer {
  CreateProposal
  CastVote { vote_choice: VoteChoice, voting_power: Int }
  ExecuteProposal
  CancelProposal
}

pub type VoteChoice {
  VoteFor
  VoteAgainst
  Abstain
}

fn has_quorum_and_majority(votes_for: Int, votes_against: Int, quorum: Int) -> Bool {
  let total_votes = votes_for + votes_against
  let majority = votes_for > votes_against
  let met_quorum = total_votes >= quorum
  majority && met_quorum
}

validator governance {
  spend(
    datum_opt: Option<GovernanceDatum>,
    redeemer: GovernanceRedeemer,
    _input: OutputReference,
    self: Transaction,
  ) -> Bool {
    expect Some(datum) = datum_opt
    let tx_sigs = self.extra_signatories

    when redeemer is {
      CreateProposal -> {
        let proposer_signed = list.has(tx_sigs, datum.proposer)
        let initial_votes = datum.votes_for == 0 && datum.votes_against == 0
        let valid_status = datum.status == Proposed
        let valid_voting_period = datum.voting_end > datum.voting_start
        proposer_signed && initial_votes && valid_status && valid_voting_period
      }
      CastVote { vote_choice, voting_power } -> {
        let voting_active = datum.status == Active
        let valid_voting_power = voting_power > 0
        let voter_signed = list.length(tx_sigs) >= 1
        voting_active && valid_voting_power && voter_signed
      }
      ExecuteProposal -> {
        let proposal_passed = datum.status == Passed
        let valid_result = has_quorum_and_majority(datum.votes_for, datum.votes_against, datum.quorum)
        proposal_passed && valid_result
      }
      CancelProposal -> {
        let proposer_signed = list.has(tx_sigs, datum.proposer)
        let not_active = datum.status == Proposed
        proposer_signed && not_active
      }
    }
  }
}
