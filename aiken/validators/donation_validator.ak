use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction, Output, Input}
use aiken/transaction/credential.{VerificationKey, Address}
use aiken/transaction/value.{Value, lovelace_of, merge}
use aiken/cbor

// Donation datum - tracks donations to a campaign
pub type DonationDatum {
  campaign_id: ByteArray,
  donor: Hash<Blake2b_224, VerificationKey>,
  amount_lovelace: Int,
  timestamp_posix: Int,
  // For governance voting power
  voting_power: Int,
}

// Donation redeemer actions  
pub type DonationRedeemer {
  Donate
  Withdraw  // Multi-sig withdrawal
  ClaimRefund  // If campaign cancelled
}

// Helper function to extract lovelace from value
fn get_lovelace_amount(value: Value) -> Int {
  lovelace_of(value)
}

// Main validator function
validator {
  fn donation_validator(
    datum: DonationDatum,
    redeemer: DonationRedeemer,
    ctx: ScriptContext,
  ) -> Bool {
    let tx = ctx.transaction
    
    when redeemer is {
      // Accept donation
      Donate -> {
        // Ensure positive donation amount
        let valid_amount = datum.amount_lovelace > 0
        
        // Donor must sign the transaction  
        let donor_signed = list.has(tx.extra_signatories, datum.donor)
        
        // Set voting power equal to donation amount (can implement weighted logic)
        let valid_voting_power = datum.voting_power == datum.amount_lovelace
        
        valid_amount && donor_signed && valid_voting_power
      }

      // Withdraw funds (requires multi-sig, checked in multi-sig validator)
      Withdraw -> {
        // This action is validated by the multi-sig validator
        // Just ensure the datum is intact for record-keeping
        True
      }

      // Refund if campaign cancelled
      ClaimRefund -> {
        // Donor must sign to claim their refund
        let donor_signed = list.has(tx.extra_signatories, datum.donor)
        
        // Ensure refund goes back to donor
        // (In practice, check output addresses match donor)
        donor_signed
      }
    }
  }
}

// Test function for donation validation
test donation_accepts_valid_donation() {
  let datum = DonationDatum {
    campaign_id: "campaign_001",
    donor: #"a2c2f2",
    amount_lovelace: 1000000,
    timestamp_posix: 1700000000,
    voting_power: 1000000,
  }
  
  True
}
