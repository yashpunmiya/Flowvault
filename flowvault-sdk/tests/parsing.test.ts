/**
 * Tests for Clarity value response parsing
 */
import { describe, it, expect } from "vitest";
import { parseVaultState, parseRoutingRules } from "../src/utils";
import { tupleCV, uintCV, noneCV, someCV, principalCV } from "@stacks/transactions";
import type { ClarityValue } from "@stacks/transactions";

// ---------------------------------------------------------------------------
// parseVaultState
// ---------------------------------------------------------------------------

describe("parseVaultState", () => {
  it("should parse a complete vault state tuple", () => {
    // Build a Clarity tuple that matches the contract's get-vault-state return
    const cv: ClarityValue = tupleCV({
      "total-balance": uintCV(5000000),
      "locked-balance": uintCV(1000000),
      "unlocked-balance": uintCV(4000000),
      "lock-until-block": uintCV(200000),
      "current-block": uintCV(190000),
      "routing-rules": tupleCV({
        "lock-amount": uintCV(1000000),
        "lock-until-block": uintCV(200000),
        "split-address": someCV(
          principalCV("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG")
        ),
        "split-amount": uintCV(500000),
      }),
    });

    const state = parseVaultState(cv);

    expect(state.totalBalance).toBe(5000000);
    expect(state.lockedBalance).toBe(1000000);
    expect(state.unlockedBalance).toBe(4000000);
    expect(state.lockUntilBlock).toBe(200000);
    expect(state.currentBlock).toBe(190000);
    expect(state.routingRules.lockAmount).toBe(1000000);
    expect(state.routingRules.lockUntilBlock).toBe(200000);
    expect(state.routingRules.splitAddress).toBeTruthy();
    expect(state.routingRules.splitAmount).toBe(500000);
  });

  it("should handle zero / empty vault state", () => {
    const cv: ClarityValue = tupleCV({
      "total-balance": uintCV(0),
      "locked-balance": uintCV(0),
      "unlocked-balance": uintCV(0),
      "lock-until-block": uintCV(0),
      "current-block": uintCV(180000),
      "routing-rules": tupleCV({
        "lock-amount": uintCV(0),
        "lock-until-block": uintCV(0),
        "split-address": noneCV(),
        "split-amount": uintCV(0),
      }),
    });

    const state = parseVaultState(cv);

    expect(state.totalBalance).toBe(0);
    expect(state.lockedBalance).toBe(0);
    expect(state.unlockedBalance).toBe(0);
    expect(state.routingRules.lockAmount).toBe(0);
    expect(state.routingRules.splitAddress).toBeNull();
    expect(state.routingRules.splitAmount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// parseRoutingRules
// ---------------------------------------------------------------------------

describe("parseRoutingRules", () => {
  it("should parse a rules tuple", () => {
    const cv: ClarityValue = tupleCV({
      "lock-amount": uintCV(2000000),
      "lock-until-block": uintCV(210000),
      "split-address": someCV(
        principalCV("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG")
      ),
      "split-amount": uintCV(300000),
    });

    const rules = parseRoutingRules(cv);

    expect(rules).not.toBeNull();
    expect(rules!.lockAmount).toBe(2000000);
    expect(rules!.lockUntilBlock).toBe(210000);
    expect(rules!.splitAddress).toBeTruthy();
    expect(rules!.splitAmount).toBe(300000);
  });

  it("should return null for noneCV", () => {
    const rules = parseRoutingRules(noneCV());
    expect(rules).toBeNull();
  });

  it("should handle rules with no split", () => {
    const cv: ClarityValue = tupleCV({
      "lock-amount": uintCV(1000000),
      "lock-until-block": uintCV(200000),
      "split-address": noneCV(),
      "split-amount": uintCV(0),
    });

    const rules = parseRoutingRules(cv);

    expect(rules).not.toBeNull();
    expect(rules!.splitAddress).toBeNull();
    expect(rules!.splitAmount).toBe(0);
  });
});
