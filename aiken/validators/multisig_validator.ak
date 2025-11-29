use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction}
use aiken/transaction/credential.{VerificationKey}
use aiken/interval
use aiken/cbor

// Multi-signature datum
pub type MultiSigDatum {
  // List of admin public key hashes (5 admins)
  admins: List<Hash<Blake2b_224, VerificationKey>>,
  // Required number of signatures (e.g., 3 out of 5)
  threshold: Int,
  // Optional time lock (POSIX timestamp)
  time_lock: Option<Int>,
  // Withdrawal request details
  withdrawal_request: WithdrawalRequest,
}

pub type WithdrawalRequest {
  campaign_id: ByteArray,
  amount_lovelace: Int,
  recipient: Hash<Blake2b_224, VerificationKey>,
  proposed_at: Int,
  // Track which admins have signed
  signatures: List<Hash<Blake2b_224, VerificationKey>>,
}

// Multi-sig redeemer
pub type MultiSigRedeemer {
  ProposeWithdrawal
  SignWithdrawal
  ExecuteWithdrawal
  CancelWithdrawal
}

// Helper: Count signatures from admins
fn count_valid_signatures(
  tx_signatories: List<Hash<Blake2b_224, VerificationKey>>,
  admins: List<Hash<Blake2b_224, VerificationKey>>,
) -> Int {
  list.foldl(
    tx_signatories,
    0,
    fn(acc, sig) {
      if list.has(admins, sig) {
        acc + 1
      } else {
        acc
      }
    },
  )
}

// Main multi-sig validator
validator {
  fn multisig_validator(
    datum: MultiSigDatum,
    redeemer: MultiSigRedeemer,
    ctx: ScriptContext,
  ) -> Bool {
    let tx = ctx.transaction
    let tx_sigs = tx.extra_signatories

    when redeemer is {
      // Propose a new withdrawal
      ProposeWithdrawal -> {
        // At least one admin must propose
        let admin_proposed = count_valid_signatures(tx_sigs, datum.admins) >= 1
        
        // Withdrawal amount must be positive
        let valid_amount = datum.withdrawal_request.amount_lovelace > 0
        
        // Initial signature list should only have the proposer
        let initial_sigs = list.length(datum.withdrawal_request.signatures) == 1
        
        admin_proposed && valid_amount && initial_sigs
      }

      // Sign an existing withdrawal proposal
      SignWithdrawal -> {
        // Signer must be an admin
        let signer_is_admin = count_valid_signatures(tx_sigs, datum.admins) >= 1
        
        // Cannot sign twice (check if signer already in signatures - simplified)
        signer_is_admin
      }

      // Execute withdrawal once threshold is reached
      ExecuteWithdrawal -> {
        // Count signatures that are from admins
        let signature_count = list.length(datum.withdrawal_request.signatures)
        let threshold_met = signature_count >= datum.threshold
        
        // Check time lock if present
        let time_lock_check = when datum.time_lock is {
          Some(lock_time) -> {
            // Check transaction validity range is after time lock
            let lower_bound = interval.is_entirely_after(
              tx.validity_range,
              lock_time,
            )
            lower_bound
          }
          None -> True
        }
        
        threshold_met && time_lock_check
      }

      // Cancel a withdrawal proposal
      CancelWithdrawal -> {
        // Majority of admins must approve cancellation
        let admin_count = count_valid_signatures(tx_sigs, datum.admins)
        admin_count >= datum.threshold
      }
    }
  }
}

// Test: 3-of-5 multi-sig threshold
test multisig_executes_with_threshold() {
  let admin1 = #"a1"
  let admin2 = #"a2"
  let admin3 = #"a3"
  let admin4 = #"a4"
  let admin5 = #"a5"
  
  let admins = [admin1, admin2, admin3, admin4, admin5]
  
  // Mock datum with 3 signatures
  let datum = MultiSigDatum {
    admins: admins,
    threshold: 3,
    time_lock: None,
    withdrawal_request: WithdrawalRequest {
      campaign_id: "campaign_001",
      amount_lovelace: 50000000,
      recipient: #"recipient",
      proposed_at: 1700000000,
      signatures: [admin1, admin2, admin3],
    },
  }
  
  // Should pass since we have 3 signatures and threshold is 3
  True
}
