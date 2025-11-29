use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction, ValidityRange}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value
use aiken/cbor

// Campaign datum structure
pub type CampaignDatum {
  campaign_id: ByteArray,
  creator: Hash<Blake2b_224, VerificationKey>,
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

// Main validator function
validator {
  fn campaign_validator(
    datum: CampaignDatum,
    redeemer: CampaignRedeemer,
    ctx: ScriptContext,
  ) -> Bool {
    // Extract transaction from context
    let tx = ctx.transaction

    when redeemer is {
      // Creating a new campaign
      CreateCampaign -> {
        // Verify campaign parameters
        let valid_goal = datum.goal_lovelace > 0
        let valid_deadline = datum.deadline_posix > 0
        let initial_state = datum.total_raised == 0
        let initial_status = datum.status == Active

        // Creator must sign the transaction
        let creator_signed = list.has(tx.extra_signatories, datum.creator)

        valid_goal && valid_deadline && initial_state && initial_status && creator_signed
      }

      // Updating campaign (e.g., adding updates)
      UpdateCampaign -> {
        // Only creator can update
        list.has(tx.extra_signatories, datum.creator)
      }

      // Canceling campaign (only if not funded)
      CancelCampaign -> {
        let creator_signed = list.has(tx.extra_signatories, datum.creator)
        let no_funds = datum.total_raised == 0

        creator_signed && no_funds
      }

      // Completing campaign (reached goal)
      CompleteCampaign -> {
        let goal_reached = datum.total_raised >= datum.goal_lovelace
        let creator_signed = list.has(tx.extra_signatories, datum.creator)

        goal_reached && creator_signed
      }
    }
  }
}
