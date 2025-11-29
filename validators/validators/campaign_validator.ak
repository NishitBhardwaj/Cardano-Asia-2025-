use cardano/transaction.{OutputReference, Transaction}
use aiken/collection/list

// Simple type alias for verification key hash (28-byte Blake2b hash)
pub type VerificationKeyHash =
  ByteArray

// Campaign datum structure
pub type CampaignDatum {
  campaign_id: ByteArray,
  creator: VerificationKeyHash,
  title: ByteArray,
  goal_lovelace: Int,
  deadline_posix: Int,
  total_raised: Int,
  status: CampaignStatus,
}

pub type CampaignStatus {
  Active
  Completed
  Cancelled
}

// Campaign redeemer actions
pub type CampaignRedeemer {
  CreateCampaign
  UpdateCampaign
  CancelCampaign
  CompleteCampaign
}

// Spend validator for campaign management
validator campaign {
  spend(
    datum_opt: Option<CampaignDatum>,
    redeemer: CampaignRedeemer,
    _input: OutputReference,
    self: Transaction,
  ) -> Bool {
    expect Some(datum) = datum_opt
    
    when redeemer is {
      // Creating a new campaign
      CreateCampaign -> {
        // Verify campaign parameters
        let valid_goal = datum.goal_lovelace > 0
        let valid_deadline = datum.deadline_posix > 0
        let initial_state = datum.total_raised == 0
        let initial_status = datum.status == Active

        // Creator must sign the transaction
        let creator_signed = list.has(self.extra_signatories, datum.creator)

        valid_goal && valid_deadline && initial_state && initial_status && creator_signed
      }

      // Updating campaign
      UpdateCampaign -> {
        list.has(self.extra_signatories, datum.creator)
      }

      // Canceling campaign (only if not funded)
      CancelCampaign -> {
        let creator_signed = list.has(self.extra_signatories, datum.creator)
        let no_funds = datum.total_raised == 0
        creator_signed && no_funds
      }

      // Completing campaign (reached goal)
      CompleteCampaign -> {
        let goal_reached = datum.total_raised >= datum.goal_lovelace
        let creator_signed = list.has(self.extra_signatories, datum.creator)
        goal_reached && creator_signed
      }
    }
  }
}
