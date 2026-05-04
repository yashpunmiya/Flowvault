import { describe, expect, it } from "vitest";
import { extractStxAddress, requireStxAddress, truncateAddress } from "@/lib/wallet";

describe("wallet helpers", () => {
  it("extracts Stacks addresses from current Stacks Connect storage shape", () => {
    const address = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

    expect(
      extractStxAddress({
        stx: [{ address, publicKey: "pub" }],
        btc: [{ address: "tb1qexample" }],
      })
    ).toBe(address);
  });

  it("extracts Stacks addresses from array-shaped wallet responses", () => {
    const address = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

    expect(
      requireStxAddress([
        { address: "tb1qexample", symbol: "BTC" },
        { address, symbol: "STX" },
      ])
    ).toBe(address);
  });

  it("throws a clean error when a wallet response has no Stacks address", () => {
    expect(() => requireStxAddress([{ address: "tb1qexample" }])).toThrow(
      /did not return a Stacks address/
    );
  });

  it("formats connected wallet addresses for display", () => {
    expect(truncateAddress("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")).toBe(
      "ST1PQH...GZGM"
    );
  });
});
