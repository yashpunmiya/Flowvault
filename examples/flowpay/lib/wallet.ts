const STX_PREFIXES = ["ST", "SP", "SM", "SN"];

function isStacksAddress(value: unknown): value is string {
  return (
    typeof value === "string" &&
    STX_PREFIXES.some((prefix) => value.startsWith(prefix))
  );
}

function searchForStacksAddress(input: unknown): string | null {
  if (!input) return null;

  if (isStacksAddress(input)) return input;

  if (Array.isArray(input)) {
    for (const item of input) {
      const found = searchForStacksAddress(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof input === "object") {
    const record = input as Record<string, unknown>;

    if (isStacksAddress(record.address)) return record.address;
    if (isStacksAddress(record.stxAddress)) return record.stxAddress;

    if ("stx" in record) {
      const found = searchForStacksAddress(record.stx);
      if (found) return found;
    }

    for (const value of Object.values(record)) {
      const found = searchForStacksAddress(value);
      if (found) return found;
    }
  }

  return null;
}

export function extractStxAddress(addresses: unknown): string | null {
  return searchForStacksAddress(addresses);
}

export function requireStxAddress(addresses: unknown): string {
  const address = extractStxAddress(addresses);
  if (!address) {
    throw new Error(
      "Connected wallet did not return a Stacks address. Select a Stacks testnet account and try again."
    );
  }
  return address;
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
