;; Mock USDCx Token Contract
;; A SIP-010 compliant mock token for testing FlowVault
;; Simulates the USDCx token on Stacks for local testing

;; Implement SIP-010 trait
(impl-trait .sip-010-trait.sip-010-trait)

;; Token definition - 6 decimals like real USDC
(define-fungible-token usdcx)

;; ========================
;; Constants
;; ========================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))

;; ========================
;; Data Variables
;; ========================

(define-data-var token-uri (optional (string-utf8 256)) none)

;; ========================
;; SIP-010 Required Functions
;; ========================

;; Transfer tokens from sender to recipient
;; Per SIP-010: sender must be tx-sender or contract-caller
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    ;; Validate that sender is tx-sender or contract-caller (for vault contracts)
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) ERR-NOT-TOKEN-OWNER)
    ;; Perform the transfer
    (try! (ft-transfer? usdcx amount sender recipient))
    ;; Print memo if provided (per SIP-010)
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; Get the token name
(define-read-only (get-name)
  (ok "Mock USDCx")
)

;; Get the token symbol
(define-read-only (get-symbol)
  (ok "mUSDCx")
)

;; Get the number of decimals (6 like real USDC)
(define-read-only (get-decimals)
  (ok u6)
)

;; Get the balance of an account
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance usdcx who))
)

;; Get the total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply usdcx))
)

;; Get the token URI
(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; ========================
;; Admin Functions (for testing)
;; ========================

;; Mint tokens to an address (for testing only)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-OWNER-ONLY)
    (ft-mint? usdcx amount recipient)
  )
)

;; Faucet function - allows anyone to get test tokens (for testing)
(define-public (faucet (amount uint))
  (begin
    ;; Limit faucet to 10000 USDCx (10000 * 10^6 micro-units)
    (asserts! (<= amount u10000000000) (err u103))
    (ft-mint? usdcx amount tx-sender)
  )
)

