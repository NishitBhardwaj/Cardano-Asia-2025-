use cardano/transaction.{OutputReference, Transaction}
use aiken/collection/list

pub type VerificationKeyHash = ByteArray

// Donation datum
pub type DonationDatum {
  campaign_id: ByteArray,
  donor: VerificationKeyHash,
  amount_lovelace: Int,
  timestamp_posix: Int,
  voting_power: Int,
}

pub type DonationRedeemer {
  Donate
  Withdraw
  ClaimRefund
}

validator donation {
  spend(
    datum_opt: Option<DonationDatum>,
    redeemer: DonationRedeemer,
    _input: OutputReference,
    self: Transaction,
  ) -> Bool {
    expect Some(datum) = datum_opt
    
    when redeemer is {
      Donate -> {
        let valid_amount = datum.amount_lovelace > 0
        let donor_signed = list.has(self.extra_signatories, datum.donor)
        let valid_voting_power = datum.voting_power == datum.amount_lovelace
        valid_amount && donor_signed && valid_voting_power
      }
      Withdraw -> True
      ClaimRefund -> list.has(self.extra_signatories, datum.donor)
    }
  }
}
