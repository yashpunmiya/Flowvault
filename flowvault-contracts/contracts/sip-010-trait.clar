;; SIP-010 Fungible Token Trait
;; Standard trait definition for fungible tokens on Stacks
;; Reference: https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md

(define-trait sip-010-trait
  (
    ;; Transfer tokens from sender to recipient
    ;; Returns (ok true) on success, or error on failure
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))

    ;; Get the name of the token
    (get-name () (response (string-ascii 32) uint))

    ;; Get the symbol of the token
    (get-symbol () (response (string-ascii 32) uint))

    ;; Get the number of decimals used
    (get-decimals () (response uint uint))

    ;; Get the balance of an account
    (get-balance (principal) (response uint uint))

    ;; Get the total supply of tokens
    (get-total-supply () (response uint uint))

    ;; Get the token URI for metadata
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)

