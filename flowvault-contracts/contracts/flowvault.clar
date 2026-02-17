;; FlowVault - Programmable Routing Vault for USDCx
;; 
;; A Clarity smart contract that:
;; - Accepts USDCx deposits
;; - Stores routing rules per user  
;; - Executes routing logic deterministically at deposit time
;; - Enforces time-based locks using block height
;; - Allows manual withdrawals of unlocked funds
;;
;; Routing Rules (executed at deposit time):
;; 1. LOCK - A fixed amount is locked until a specific block height
;; 2. SPLIT - A fixed amount is transferred to another principal
;; 3. HOLD - Remaining balance stays in the vault

;; ========================
;; Traits
;; ========================

(use-trait sip-010-trait .sip-010-trait.sip-010-trait)

;; ========================
;; Constants
;; ========================

(define-constant CONTRACT-OWNER tx-sender)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u1000))
(define-constant ERR-INVALID-AMOUNT (err u1001))
(define-constant ERR-INSUFFICIENT-BALANCE (err u1002))
(define-constant ERR-FUNDS-LOCKED (err u1003))
(define-constant ERR-ROUTING-EXCEEDS-DEPOSIT (err u1004))
(define-constant ERR-TRANSFER-FAILED (err u1005))
(define-constant ERR-NO-VAULT-CONFIG (err u1006))
(define-constant ERR-INVALID-SPLIT-ADDRESS (err u1007))
(define-constant ERR-INVALID-LOCK-BLOCK (err u1008))
(define-constant ERR-ARITHMETIC-OVERFLOW (err u1009))
(define-constant ERR-LOCK-EXCEEDS-HOLD (err u1010))
(define-constant ERR-SPLIT-TO-SELF (err u1011))

;; ========================
;; Data Maps
;; ========================

;; Routing rules configuration per user
(define-map routing-rules
  principal
  {
    lock-amount: uint,
    lock-until-block: uint,
    split-address: (optional principal),
    split-amount: uint
  }
)

;; Vault balances per user
(define-map vault-balances
  principal
  {
    total-balance: uint,
    locked-balance: uint,
    lock-until-block: uint
  }
)

;; ========================
;; Read-Only Functions
;; ========================

;; Get the current vault state for a user
(define-read-only (get-vault-state (user principal))
  (let
    (
      (balance-data (default-to 
        { total-balance: u0, locked-balance: u0, lock-until-block: u0 }
        (map-get? vault-balances user)
      ))
      (rules-data (default-to
        { lock-amount: u0, lock-until-block: u0, split-address: none, split-amount: u0 }
        (map-get? routing-rules user)
      ))
      (current-block stacks-block-height)
      (is-locked (> (get lock-until-block balance-data) current-block))
      (effective-locked (if is-locked (get locked-balance balance-data) u0))
      (unlocked-balance (- (get total-balance balance-data) effective-locked))
    )
    {
      total-balance: (get total-balance balance-data),
      locked-balance: effective-locked,
      unlocked-balance: unlocked-balance,
      lock-until-block: (get lock-until-block balance-data),
      current-block: current-block,
      routing-rules: rules-data
    }
  )
)

;; Get routing rules for a user
(define-read-only (get-routing-rules (user principal))
  (map-get? routing-rules user)
)

;; Check if user has any locked funds currently
(define-read-only (has-locked-funds (user principal))
  (let
    (
      (balance-data (default-to 
        { total-balance: u0, locked-balance: u0, lock-until-block: u0 }
        (map-get? vault-balances user)
      ))
    )
    (and 
      (> (get locked-balance balance-data) u0)
      (> (get lock-until-block balance-data) stacks-block-height)
    )
  )
)

;; Get current block height (for frontend reference)
(define-read-only (get-current-block-height)
  stacks-block-height
)

;; ========================
;; Public Functions
;; ========================

;; Set routing rules for the caller
;; Rules are validated and stored, will be executed on next deposit
(define-public (set-routing-rules 
    (lock-amount uint)
    (lock-until-block uint)
    (split-address (optional principal))
    (split-amount uint)
  )
  (begin
    ;; Validate: if split amount > 0, split address must be provided
    (asserts! 
      (or (is-eq split-amount u0) (is-some split-address))
      ERR-INVALID-SPLIT-ADDRESS
    )
    ;; Validate: split address cannot be the caller (split-to-self)
    (asserts!
      (match split-address
        addr (not (is-eq addr tx-sender))
        true
      )
      ERR-SPLIT-TO-SELF
    )
    ;; Validate: if lock amount > 0, lock-until-block must be in the future
    (asserts!
      (or (is-eq lock-amount u0) (> lock-until-block stacks-block-height))
      ERR-INVALID-LOCK-BLOCK
    )
    ;; Store the routing rules (overwrites previous config)
    (map-set routing-rules tx-sender {
      lock-amount: lock-amount,
      lock-until-block: lock-until-block,
      split-address: split-address,
      split-amount: split-amount
    })
    (ok true)
  )
)

;; ========================
;; Private Helper Functions  
;; ========================

;; Get contract's own principal (call this outside of let bindings)
(define-private (get-contract-principal)
  (as-contract tx-sender)
)

;; Internal transfer from contract to recipient
(define-private (transfer-from-contract (token <sip-010-trait>) (amount uint) (recipient principal))
  (as-contract (contract-call? token transfer amount tx-sender recipient none))
)

;; Deposit USDCx and execute routing rules
;; The token contract must be passed as a trait reference
(define-public (deposit (token <sip-010-trait>) (amount uint))
  (let
    (
      (depositor tx-sender)
      (rules (default-to
        { lock-amount: u0, lock-until-block: u0, split-address: none, split-amount: u0 }
        (map-get? routing-rules depositor)
      ))
      (current-balance-data (default-to
        { total-balance: u0, locked-balance: u0, lock-until-block: u0 }
        (map-get? vault-balances depositor)
      ))
      (lock-amt (get lock-amount rules))
      (split-amt (get split-amount rules))
      (split-addr (get split-address rules))
      (lock-block (get lock-until-block rules))
      (current-lock-block (get lock-until-block current-balance-data))
      (current-locked-bal (get locked-balance current-balance-data))
      (is-current-lock-active (> current-lock-block stacks-block-height))
    )
    ;; Validate amount > 0
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Validate routing rules don't exceed deposit amount (overflow check)
    (asserts! (and (<= lock-amt amount) (<= split-amt amount)) ERR-ROUTING-EXCEEDS-DEPOSIT)
    (let ((total-routed (+ lock-amt split-amt)))
      (asserts! (<= total-routed amount) ERR-ROUTING-EXCEEDS-DEPOSIT)
    
    ;; Transfer USDCx from depositor to this contract
    (try! (contract-call? token transfer amount depositor (get-contract-principal) none))
    
    ;; Execute SPLIT if configured
    (match split-addr
      recipient-addr
        (if (> split-amt u0)
          (try! (transfer-from-contract token split-amt recipient-addr))
          true
        )
      true
    )
    
    ;; Calculate hold amount (what remains in vault after split)
    (let
      (
        (hold-amount (- amount split-amt))
        ;; Clear expired locks before processing new deposit
        (effective-current-locked (if is-current-lock-active current-locked-bal u0))
        (effective-current-lock-block (if is-current-lock-active current-lock-block u0))
      )
      ;; Validate lock amount doesn't exceed hold amount
      (asserts! (<= lock-amt hold-amount) ERR-LOCK-EXCEEDS-HOLD)
      ;; Prevent lock block reduction if there are active locked funds
      (asserts!
        (or
          (is-eq lock-amt u0)
          (not is-current-lock-active)
          (>= lock-block current-lock-block)
        )
        ERR-INVALID-LOCK-BLOCK
      )
      (let
        (
          (new-total (+ (get total-balance current-balance-data) hold-amount))
          (new-locked (if (> lock-amt u0) 
            (+ effective-current-locked lock-amt)
            effective-current-locked
          ))
          (new-lock-block (if (> lock-amt u0)
            lock-block
            effective-current-lock-block
          ))
        )
        ;; Overflow check for new-total
        (asserts! (>= new-total (get total-balance current-balance-data)) ERR-ARITHMETIC-OVERFLOW)
        ;; Update vault balances
        (map-set vault-balances depositor {
          total-balance: new-total,
          locked-balance: new-locked,
          lock-until-block: new-lock-block
        })
        
        ;; Emit deposit event
        (print {
          event: "deposit",
          depositor: depositor,
          amount: amount,
          split-amount: split-amt,
          split-to: split-addr,
          lock-amount: lock-amt,
          lock-until: lock-block,
          hold-amount: hold-amount
        })
        
        (ok { deposited: amount, held: hold-amount, split: split-amt, locked: lock-amt })
      )
    )))
  )
)

;; Withdraw unlocked funds from the vault
(define-public (withdraw (token <sip-010-trait>) (amount uint))
  (let
    (
      (withdrawer tx-sender)
      (balance-data (default-to
        { total-balance: u0, locked-balance: u0, lock-until-block: u0 }
        (map-get? vault-balances withdrawer)
      ))
      (total-bal (get total-balance balance-data))
      (locked-bal (get locked-balance balance-data))
      (lock-block (get lock-until-block balance-data))
      (current-block stacks-block-height)
      ;; If lock has expired, locked balance is effectively 0
      (effective-locked (if (> lock-block current-block) locked-bal u0))
      (available-balance (- total-bal effective-locked))
    )
    ;; Validate amount > 0
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Validate sufficient unlocked balance
    (asserts! (<= amount available-balance) ERR-FUNDS-LOCKED)
    
    ;; Transfer tokens back to user
    (try! (transfer-from-contract token amount withdrawer))
    
    ;; Update balances
    (let
      (
        (new-total (- total-bal amount))
        ;; If lock expired, reset locked balance
        (new-locked (if (> lock-block current-block)
          locked-bal
          u0
        ))
        (new-lock-block (if (> lock-block current-block)
          lock-block
          u0
        ))
      )
      (map-set vault-balances withdrawer {
        total-balance: new-total,
        locked-balance: new-locked,
        lock-until-block: new-lock-block
      })
      
      ;; Emit withdraw event
      (print {
        event: "withdraw",
        withdrawer: withdrawer,
        amount: amount,
        remaining-balance: new-total
      })
      
      (ok { withdrawn: amount, remaining: new-total })
    )
  )
)

;; Clear routing rules for the caller
(define-public (clear-routing-rules)
  (begin
    (map-delete routing-rules tx-sender)
    (ok true)
  )
)

