import { NextResponse } from "next/server";
import { FlowVault, type NetworkName } from "flowvault-sdk";

type Action = "getVaultState" | "getCurrentBlockHeight";

interface RequestBody {
  action: Action;
  payload?: Record<string, unknown>;
}

function getSdk(): FlowVault {
  const network = (process.env.FLOWVAULT_NETWORK ??
    process.env.NEXT_PUBLIC_FLOWVAULT_NETWORK ??
    "testnet") as NetworkName;
  const contractAddress =
    process.env.FLOWVAULT_CONTRACT_ADDRESS ??
    process.env.NEXT_PUBLIC_FLOWVAULT_CONTRACT_ADDRESS ??
    "";
  const contractName =
    process.env.FLOWVAULT_CONTRACT_NAME ??
    process.env.NEXT_PUBLIC_FLOWVAULT_CONTRACT_NAME ??
    "flowvault";
  const tokenContractAddress =
    process.env.FLOWVAULT_TOKEN_CONTRACT_ADDRESS ??
    process.env.NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_ADDRESS ??
    "";
  const tokenContractName =
    process.env.FLOWVAULT_TOKEN_CONTRACT_NAME ??
    process.env.NEXT_PUBLIC_FLOWVAULT_TOKEN_CONTRACT_NAME ??
    "usdcx";

  return new FlowVault({
    network,
    contractAddress,
    contractName,
    tokenContractAddress,
    tokenContractName,
  });
}

function errorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown error";
  const name = err instanceof Error ? err.name : "Error";
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? (err as { code?: unknown }).code
      : undefined;

  return NextResponse.json(
    {
      ok: false,
      error: {
        name,
        message,
        code,
      },
    },
    { status: 400 }
  );
}

export async function POST(req: Request) {
  let body: RequestBody;

  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  try {
    const sdk = getSdk();
    const payload = body.payload ?? {};

    if (body.action === "getVaultState") {
      const userAddress = String(payload.userAddress ?? "");
      const state = await sdk.getVaultState(userAddress);
      return NextResponse.json({ ok: true, data: state });
    }

    if (body.action === "getCurrentBlockHeight") {
      const senderAddress = String(payload.senderAddress ?? "");
      const currentBlock = await sdk.getCurrentBlockHeight(senderAddress);
      return NextResponse.json({ ok: true, data: { currentBlock } });
    }

    return NextResponse.json(
      { ok: false, error: { message: "Unsupported action" } },
      { status: 400 }
    );
  } catch (err) {
    return errorResponse(err);
  }
}
