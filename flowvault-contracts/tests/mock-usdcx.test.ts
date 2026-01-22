import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Mock USDCx Token Tests", () => {
  it("ensures simnet is well initialized", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  describe("Token Metadata", () => {
    it("returns correct token name", () => {
      const { result } = simnet.callReadOnlyFn(
        "mock-usdcx",
        "get-name",
        [],
        wallet1
      );
      expect(result).toBeOk(Cl.stringAscii("Mock USDCx"));
    });

    it("returns correct token symbol", () => {
      const { result } = simnet.callReadOnlyFn(
        "mock-usdcx",
        "get-symbol",
        [],
        wallet1
      );
      expect(result).toBeOk(Cl.stringAscii("mUSDCx"));
    });

    it("returns correct decimals (6)", () => {
      const { result } = simnet.callReadOnlyFn(
        "mock-usdcx",
        "get-decimals",
        [],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(6));
    });
  });

  describe("Minting", () => {
    it("allows deployer to mint tokens", () => {
      const { result } = simnet.callPublicFn(
        "mock-usdcx",
        "mint",
        [Cl.uint(1000000), Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Check balance
      const balance = simnet.callReadOnlyFn(
        "mock-usdcx",
        "get-balance",
        [Cl.principal(wallet1)],
        wallet1
      );
      expect(balance.result).toBeOk(Cl.uint(1000000));
    });

    it("prevents non-deployer from minting", () => {
      const { result } = simnet.callPublicFn(
        "mock-usdcx",
        "mint",
        [Cl.uint(1000000), Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-OWNER-ONLY
    });
  });

  describe("Faucet", () => {
    it("allows anyone to get test tokens from faucet", () => {
      const { result } = simnet.callPublicFn(
        "mock-usdcx",
        "faucet",
        [Cl.uint(1000000)],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("limits faucet to 10000 USDCx", () => {
      const { result } = simnet.callPublicFn(
        "mock-usdcx",
        "faucet",
        [Cl.uint(10000000001)], // More than 10000 USDCx
        wallet1
      );
      expect(result).toBeErr(Cl.uint(103));
    });
  });

  describe("Transfer", () => {
    it("allows token transfer between accounts", () => {
      // Mint tokens first
      simnet.callPublicFn(
        "mock-usdcx",
        "mint",
        [Cl.uint(1000000), Cl.principal(wallet1)],
        deployer
      );

      // Transfer
      const { result } = simnet.callPublicFn(
        "mock-usdcx",
        "transfer",
        [
          Cl.uint(500000),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));

      // Check balances
      const balance1 = simnet.callReadOnlyFn(
        "mock-usdcx",
        "get-balance",
        [Cl.principal(wallet1)],
        wallet1
      );
      const balance2 = simnet.callReadOnlyFn(
        "mock-usdcx",
        "get-balance",
        [Cl.principal(wallet2)],
        wallet2
      );
      expect(balance1.result).toBeOk(Cl.uint(500000));
      expect(balance2.result).toBeOk(Cl.uint(500000));
    });

    it("prevents unauthorized transfers", () => {
      // Mint tokens to wallet1
      simnet.callPublicFn(
        "mock-usdcx",
        "mint",
        [Cl.uint(1000000), Cl.principal(wallet1)],
        deployer
      );

      // Try to transfer wallet1's tokens from wallet2
      const { result } = simnet.callPublicFn(
        "mock-usdcx",
        "transfer",
        [
          Cl.uint(500000),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet2
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR-NOT-TOKEN-OWNER
    });
  });
});
