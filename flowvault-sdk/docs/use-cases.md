# Use Cases

Real-world scenarios where FlowVault's programmable routing shines.

---

## 1. Escrow Model

**Scenario:** A freelancer and client agree on a milestone payment. Funds are
locked in the vault until the milestone block height, then released.

**Routing Configuration:**

```ts
await vault.setRoutingRules({
  lockAmount: tokenToMicro(5000),  // Lock entire payment
  lockUntilBlock: 220000,          // ~2 weeks from now
  splitAddress: null,              // No split
  splitAmount: 0,
});
```

**Expected Behaviour:**
- Client deposits 5,000 USDCx → entire amount is locked.
- Neither party can withdraw until block 220,000.
- After block 220,000 the funds become unlocked and the freelancer (or client) can withdraw.

---

## 2. DAO Treasury Flow

**Scenario:** A DAO receives membership fees. 20% is locked as a reserve
for 6 months (~25,000 blocks). The rest is immediately available for
operational expenses.

**Routing Configuration:**

```ts
await vault.setRoutingRules({
  lockAmount: tokenToMicro(200),   // 20% of 1000
  lockUntilBlock: 250000,          // ~6 months from now
  splitAddress: null,
  splitAmount: 0,
});

await vault.deposit(tokenToMicro(1000));
// Result: 200 locked, 800 held (unlocked)
```

**Expected Behaviour:**
- Every deposit automatically reserves 20% in a time-lock.
- The remaining 80% is available for the DAO to spend immediately.
- Reserve cannot be touched until the lock expires, ensuring long-term solvency.

---

## 3. Payroll Routing

**Scenario:** An employer deposits payroll into the vault. A fixed amount is
automatically forwarded to an employee's address; the rest stays in the
employer's vault for future payrolls.

**Routing Configuration:**

```ts
await vault.setRoutingRules({
  lockAmount: 0,
  lockUntilBlock: 0,
  splitAddress: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", // employee
  splitAmount: tokenToMicro(3000), // monthly salary
});

await vault.deposit(tokenToMicro(10000));
// Result: 3000 sent to employee, 7000 held in vault
```

**Expected Behaviour:**
- Each deposit sends exactly 3,000 USDCx to the employee on-chain.
- Remaining 7,000 stays in the employer's vault.
- No custodial intermediary needed.

---

## 4. Subscription Split

**Scenario:** A SaaS platform collects subscription revenue. A portion is
automatically forwarded to a revenue-sharing partner, and some is locked
as a refund reserve.

**Routing Configuration:**

```ts
await vault.setRoutingRules({
  lockAmount: tokenToMicro(10),    // $10 refund reserve per sub
  lockUntilBlock: 215000,          // ~30-day refund window
  splitAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // partner
  splitAmount: tokenToMicro(15),   // $15 revenue share
});

await vault.deposit(tokenToMicro(50));
// Result: 10 locked (refund reserve), 15 split (partner), 25 held (platform)
```

**Expected Behaviour:**
- Each subscription payment is automatically split three ways.
- Partner receives their share instantly on-chain.
- Refund reserve is locked and cannot be spent during the refund window.
- Platform keeps the remainder as available balance.

---

## Summary

| Use Case       | Lock | Split | Hold | Key Benefit                    |
| -------------- | ---- | ----- | ---- | ------------------------------ |
| Escrow         | ✅   | —     | —    | Trustless milestone payments   |
| DAO Treasury   | ✅   | —     | ✅   | Automatic reserve management   |
| Payroll        | —    | ✅    | ✅   | On-chain salary distribution   |
| Subscription   | ✅   | ✅    | ✅   | Revenue split + refund reserve |
