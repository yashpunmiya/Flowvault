export function extractStxAddress(addresses: unknown): string | null {
  if (!addresses) return null;

  if (typeof addresses === "object" && addresses !== null && "stx" in addresses) {
    const stxList = (addresses as { stx?: Array<{ address?: string }> }).stx;
    if (Array.isArray(stxList) && stxList[0]?.address) {
      return stxList[0].address;
    }
  }

  if (Array.isArray(addresses)) {
    const first = addresses.find((item) => {
      if (!item || typeof item !== "object") return false;
      const type = (item as { type?: string }).type;
      return type === "stx" || type === "p2pkh";
    }) as { address?: string } | undefined;

    if (first?.address) return first.address;

    const maybeAddress = addresses.find((item) => {
      if (!item || typeof item !== "object") return false;
      return typeof (item as { address?: unknown }).address === "string";
    }) as { address?: string } | undefined;

    if (maybeAddress?.address) return maybeAddress.address;
  }

  return null;
}
