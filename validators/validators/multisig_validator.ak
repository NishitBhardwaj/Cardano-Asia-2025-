use cardano/transaction.{OutputReference, Transaction}
use aiken/collection/list
use aiken/interval

pub type VerificationKeyHash = ByteArray

pub type MultiSigDatum {
  admins: List<VerificationKeyHash>,
  threshold: Int,
  time_lock: Option<Int>,
  withdrawal_request: WithdrawalRequest,
}

pub type WithdrawalRequest {
  campaign_id: ByteArray,
  amount_lovelace: Int,
  recipient: VerificationKeyHash,
  proposed_at: Int,
  signatures: List<VerificationKeyHash>,
}

pub type MultiSigRedeemer {
  ProposeWithdrawal
  SignWithdrawal
  ExecuteWithdrawal
  CancelWithdrawal
}

fn count_valid_signatures(
  tx_sigs: List<VerificationKeyHash>,
  admins: List<VerificationKeyHash>,
) -> Int {
  list.foldl(
    tx_sigs,
    0,
    fn(acc, sig) { if list.has(admins, sig) { acc + 1 } else { acc } },
  )
}

validator multisig {
  spend(
    datum_opt: Option<MultiSigDatum>,
    redeemer: MultiSigRedeemer,
    _input: OutputReference,
    self: Transaction,
  ) -> Bool {
    expect Some(datum) = datum_opt
    let tx_sigs = self.extra_signatories

    when redeemer is {
      ProposeWithdrawal -> {
        let admin_proposed = count_valid_signatures(tx_sigs, datum.admins) >= 1
        let valid_amount = datum.withdrawal_request.amount_lovelace > 0
        let initial_sigs = list.length(datum.withdrawal_request.signatures) == 1
        admin_proposed && valid_amount && initial_sigs
      }
      SignWithdrawal -> count_valid_signatures(tx_sigs, datum.admins) >= 1
      ExecuteWithdrawal -> {
        let signature_count = list.length(datum.withdrawal_request.signatures)
        let threshold_met = signature_count >= datum.threshold
        let time_lock_check = when datum.time_lock is {
          Some(lock_time) -> interval.is_entirely_after(self.validity_range, lock_time)
          None -> True
        }
        threshold_met && time_lock_check
      }
      CancelWithdrawal -> count_valid_signatures(tx_sigs, datum.admins) >= datum.threshold
    }
  }
}
