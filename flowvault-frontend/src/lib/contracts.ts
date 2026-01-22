// Contract configuration for FlowVault
export const CONTRACTS = {
  // Testnet addresses
  testnet: {
    flowvault: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD.flowvault",
    usdcx: "STD7QG84VQQ0C35SZM2EYTHZV4M8FQ0R7YNSQWPD.mock-usdcx",
  },
  // Mainnet addresses (update when deployed)
  mainnet: {
    flowvault: "SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.flowvault",
    usdcx: "SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx",
  },
} as const;

// Use testnet by default for development
export const NETWORK = "testnet" as const;
export const CURRENT_CONTRACTS = CONTRACTS[NETWORK];

// Stacks API endpoints
export const API_ENDPOINTS = {
  testnet: "https://api.testnet.hiro.so",
  mainnet: "https://api.hiro.so",
} as const;

export const API_BASE = API_ENDPOINTS[NETWORK];

// Parse contract principal into address and name
export function parseContractId(contractId: string): {
  address: string;
  name: string;
} {
  const [address, name] = contractId.split(".");
  return { address, name };
}
