"use client";

import { useMemo, useState } from "react";
import { WalletButton } from "@/components/WalletButton";
import { useFlowPay } from "@/hooks/useFlowPay";
import { useStacksWallet } from "@/hooks/useStacksWallet";
import { FLOWVAULT_NETWORK, getHiroTxUrl } from "@/lib/config";
import {
  LOCK_DURATION_BLOCKS,
  calculateFlowPayBreakdown,
  formatPercent,
  formatUsdcx,
  parseDepositAmount,
  parsePercent,
  validateFlowPayInputs,
} from "@/lib/flowpay-strategy";

function shortTx(txId: string): string {
  return txId.length > 18 ? `${txId.slice(0, 10)}...${txId.slice(-6)}` : txId;
}

function canLinkTx(txId: string): boolean {
  return txId.startsWith("0x") && txId.length > 12;
}

export function FlowPay() {
  const [depositAmount, setDepositAmount] = useState("100");
  const [savingsPercent, setSavingsPercent] = useState("30");
  const [splitPercent, setSplitPercent] = useState("20");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const wallet = useStacksWallet();
  const flowPay = useFlowPay(wallet.address);

  const inputs = useMemo(
    () => ({
      depositAmount,
      savingsPercent,
      splitPercent,
      recipientAddress,
      walletAddress: wallet.address,
    }),
    [depositAmount, recipientAddress, savingsPercent, splitPercent, wallet.address]
  );

  const parsedDeposit = useMemo(() => parseDepositAmount(depositAmount), [depositAmount]);
  const parsedSavingsPercent = useMemo(
    () => parsePercent(savingsPercent, "savings percentage"),
    [savingsPercent]
  );
  const parsedSplitPercent = useMemo(
    () => parsePercent(splitPercent, "recipient split percentage"),
    [splitPercent]
  );

  const preview = useMemo(() => {
    if (parsedDeposit.error || parsedSavingsPercent.error || parsedSplitPercent.error) {
      return calculateFlowPayBreakdown({
        depositMicro: 0n,
        savingsPercent: 0,
        splitPercent: 0,
      });
    }

    if (parsedSavingsPercent.percent + parsedSplitPercent.percent > 100) {
      return calculateFlowPayBreakdown({
        depositMicro: parsedDeposit.microAmount,
        savingsPercent: parsedSavingsPercent.percent,
        splitPercent: Math.max(0, 100 - parsedSavingsPercent.percent),
      });
    }

    return calculateFlowPayBreakdown({
      depositMicro: parsedDeposit.microAmount,
      savingsPercent: parsedSavingsPercent.percent,
      splitPercent: parsedSplitPercent.percent,
    });
  }, [
    parsedDeposit.error,
    parsedDeposit.microAmount,
    parsedSavingsPercent.error,
    parsedSavingsPercent.percent,
    parsedSplitPercent.error,
    parsedSplitPercent.percent,
  ]);

  const validation = useMemo(() => validateFlowPayInputs(inputs), [inputs]);
  const availablePercent = Math.max(
    0,
    100 - parsedSavingsPercent.percent - parsedSplitPercent.percent
  );

  const pendingMessage =
    flowPay.step === "strategy"
      ? "Confirm strategy in your wallet."
      : flowPay.step === "confirming"
        ? "Waiting for the strategy transaction to confirm."
        : flowPay.step === "deposit"
          ? "Confirm the USDCx deposit in your wallet."
          : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasAttemptedSubmit(true);
    await flowPay.deposit(inputs);
  }

  return (
    <main className="page">
      <div className="grid-surface" aria-hidden="true" />
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="mark">
              <img src="/logo.png" alt="FlowVault logo" />
            </div>
            <div>
              <p className="brand-title">FlowPay</p>
              <p className="network">Stacks {FLOWVAULT_NETWORK}</p>
            </div>
          </div>
          <WalletButton />
        </header>

        <form className="router" onSubmit={handleSubmit}>
          <section className="router-head" aria-labelledby="flowpay-title">
            <div>
              <span className="eyebrow">FlowPay</span>
              <h1 id="flowpay-title">Salary route</h1>
            </div>
            <p>Configure where one USDCx deposit goes before signing.</p>
          </section>

          <section className="route-map" aria-label="Salary route builder">
            <label className="deposit-node" htmlFor="deposit-amount">
              <span>Incoming deposit</span>
              <div>
                <input
                  id="deposit-amount"
                  className="amount-input"
                  type="number"
                  min="0"
                  step="0.000001"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(event) => setDepositAmount(event.target.value)}
                />
                <strong>USDCx</strong>
              </div>
            </label>

            <div className="lane-stack">
              <div className="lane saved-lane">
                <div className="lane-line" aria-hidden="true" />
                <label className="lane-control" htmlFor="savings-percent">
                  <span>Vault savings</span>
                  <input
                    id="savings-percent"
                    className="percent-input"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={savingsPercent}
                    onChange={(event) => setSavingsPercent(event.target.value)}
                  />
                  <input
                    className="range savings-range"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={savingsPercent}
                    onChange={(event) => setSavingsPercent(event.target.value)}
                    aria-label="Savings percentage"
                  />
                </label>
                <output className="lane-output">
                  <strong>{formatUsdcx(flowPay.success?.savedMicro ?? preview.savedMicro)}</strong>
                  <span>{formatPercent(parsedSavingsPercent.percent || 0)}</span>
                </output>
              </div>

              <div className="lane sent-lane">
                <div className="lane-line" aria-hidden="true" />
                <label className="lane-control" htmlFor="split-percent">
                  <span>Recipient payout</span>
                  <input
                    id="split-percent"
                    className="percent-input"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={splitPercent}
                    onChange={(event) => setSplitPercent(event.target.value)}
                  />
                  <input
                    className="range split-range"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={splitPercent}
                    onChange={(event) => setSplitPercent(event.target.value)}
                    aria-label="Recipient percentage"
                  />
                </label>
                <output className="lane-output">
                  <strong>{formatUsdcx(flowPay.success?.sentMicro ?? preview.sentMicro)}</strong>
                  <span>{formatPercent(parsedSplitPercent.percent || 0)}</span>
                </output>
              </div>

              <div className="lane available-lane">
                <div className="lane-line" aria-hidden="true" />
                <div className="lane-control read-only">
                  <span>Wallet remainder</span>
                  <strong>{formatPercent(availablePercent)}</strong>
                </div>
                <output className="lane-output">
                  <strong>{formatUsdcx(flowPay.success?.availableMicro ?? preview.availableMicro)}</strong>
                  <span>available</span>
                </output>
              </div>
            </div>
          </section>

          <section className="route-footer" aria-label="Route execution">
            <label className="recipient-field" htmlFor="recipient-address">
              <span>Recipient address</span>
              <input
                id="recipient-address"
                className="address-input"
                type="text"
                spellCheck={false}
                placeholder="ST..."
                value={recipientAddress}
                onChange={(event) => setRecipientAddress(event.target.value)}
              />
            </label>

            <div className="run-state">
              <div className={flowPay.step === "strategy" ? "step active" : "step"}>Strategy</div>
              <div className={flowPay.step === "confirming" ? "step active" : "step"}>Confirm</div>
              <div className={flowPay.step === "deposit" ? "step active" : "step"}>Deposit</div>
              <div className={flowPay.success ? "step active" : "step"}>Done</div>
              <span>{LOCK_DURATION_BLOCKS} block lock</span>
            </div>

            <button className="primary deposit-button" type="submit" disabled={flowPay.isSubmitting}>
              {flowPay.isSubmitting ? "Processing..." : "Run route"}
            </button>
          </section>

          {(wallet.error || (hasAttemptedSubmit && validation.error) || flowPay.error) && (
            <div className="status error">
              {wallet.error ?? (hasAttemptedSubmit ? validation.error : null) ?? flowPay.error}
            </div>
          )}
          {pendingMessage && <div className="status pending">{pendingMessage}</div>}
          {flowPay.success && (
            <div className="status success">
              <strong>{flowPay.success.message}</strong>
              <span>Unlock block {flowPay.success.lockUntilBlock}</span>
            </div>
          )}
          {flowPay.success && (
            <div className="tx-links">
              {[flowPay.success.strategyTxId, flowPay.success.depositTxId].map((txId, index) =>
                canLinkTx(txId) ? (
                  <a key={txId} href={getHiroTxUrl(txId)} target="_blank" rel="noreferrer">
                    {index === 0 ? "Strategy" : "Deposit"}: {shortTx(txId)}
                  </a>
                ) : (
                  <span key={`${txId}-${index}`}>
                    {index === 0 ? "Strategy" : "Deposit"}: {txId}
                  </span>
                )
              )}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
