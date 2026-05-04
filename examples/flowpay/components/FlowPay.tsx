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
      <div className="grid-surface" />
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

        <section className="app-grid">
          <div className="left-stack">
            <div className="intro" aria-labelledby="flowpay-title">
              <h1 id="flowpay-title">FlowPay</h1>
              <p className="copy">
                This simulates salary automation: one deposit saves a percentage, sends a percentage
                to another wallet, and keeps the rest available.
              </p>
              <div className="metric-strip" aria-label="Current strategy preview">
                <div>
                  <span>{formatPercent(parsedSavingsPercent.percent || 0)}</span>
                  <small>Saved</small>
                </div>
                <div>
                  <span>{formatPercent(parsedSplitPercent.percent || 0)}</span>
                  <small>Sent</small>
                </div>
                <div>
                  <span>{formatPercent(availablePercent)}</span>
                  <small>Available</small>
                </div>
              </div>
            </div>
            <form className="panel flow-form" onSubmit={handleSubmit}>
              <div className="panel-heading">
                <div>
                  <h2>One Click Flow</h2>
                  <p>Set strategy, deposit USDCx, then view the result.</p>
                </div>
                <span className="token-badge">USDCx</span>
              </div>

              <div className="field">
                <label htmlFor="deposit-amount">Total deposit</label>
                <div className="amount-shell">
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
                  <span>USDCx</span>
                </div>
              </div>

              <div className="split-controls">
                <div className="field range-field">
                  <div className="label-row">
                    <label htmlFor="savings-percent">Savings</label>
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
                  </div>
                  <input
                    className="range savings-range"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={savingsPercent}
                    onChange={(event) => setSavingsPercent(event.target.value)}
                  />
                </div>

                <div className="field range-field">
                  <div className="label-row">
                    <label htmlFor="split-percent">Recipient split</label>
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
                  </div>
                  <input
                    className="range split-range"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={splitPercent}
                    onChange={(event) => setSplitPercent(event.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="recipient-address">Recipient address</label>
                <input
                  id="recipient-address"
                  className="address-input"
                  type="text"
                  spellCheck={false}
                  placeholder="ST..."
                  value={recipientAddress}
                  onChange={(event) => setRecipientAddress(event.target.value)}
                />
              </div>

              <div className="allocation" aria-label="Deposit allocation">
                <div className="allocation-track">
                  <span
                    className="allocation-save"
                    style={{ width: `${parsedSavingsPercent.percent || 0}%` }}
                  />
                  <span
                    className="allocation-send"
                    style={{ width: `${parsedSplitPercent.percent || 0}%` }}
                  />
                  <span className="allocation-available" style={{ width: `${availablePercent}%` }} />
                </div>
                <div className="allocation-labels">
                  <span>Saved</span>
                  <span>Sent</span>
                  <span>Available</span>
                </div>
              </div>

              {(wallet.error || (hasAttemptedSubmit && validation.error) || flowPay.error) && (
                <div className="status error">
                  {wallet.error ?? (hasAttemptedSubmit ? validation.error : null) ?? flowPay.error}
                </div>
              )}
              {pendingMessage && <div className="status pending">{pendingMessage}</div>}

              <button className="primary deposit-button" type="submit" disabled={flowPay.isSubmitting}>
                {flowPay.isSubmitting ? "Processing..." : "Set strategy + deposit"}
              </button>
            </form>
          </div>

          <div className="right-stack">
            <section className="panel result-panel" aria-label="FlowPay output">
              <div className="panel-heading">
                <div>
                  <h2>Output</h2>
                  <p>Amounts are calculated before signing and enforced by FlowVault.</p>
                </div>
              </div>

              <div className="result-grid">
                <div className="result-item saved">
                  <span>You saved</span>
                  <strong>{formatUsdcx(flowPay.success?.savedMicro ?? preview.savedMicro)}</strong>
                </div>
                <div className="result-item sent">
                  <span>Sent to recipient</span>
                  <strong>{formatUsdcx(flowPay.success?.sentMicro ?? preview.sentMicro)}</strong>
                </div>
                <div className="result-item available">
                  <span>Available</span>
                  <strong>{formatUsdcx(flowPay.success?.availableMicro ?? preview.availableMicro)}</strong>
                </div>
              </div>

              {flowPay.success && (
                <div className="status success">
                  <strong>{flowPay.success.message}</strong>
                  <span>Saved funds unlock at block {flowPay.success.lockUntilBlock}.</span>
                </div>
              )}

              {flowPay.success && (
                <div className="tx-links">
                  {[flowPay.success.strategyTxId, flowPay.success.depositTxId].map((txId, index) =>
                    canLinkTx(txId) ? (
                      <a key={txId} href={getHiroTxUrl(txId)} target="_blank" rel="noreferrer">
                        {index === 0 ? "Strategy tx" : "Deposit tx"}: {shortTx(txId)}
                      </a>
                    ) : (
                      <span key={`${txId}-${index}`}>
                        {index === 0 ? "Strategy tx" : "Deposit tx"}: {txId}
                      </span>
                    )
                  )}
                </div>
              )}
            </section>

            <section className="panel route-panel" aria-label="Transaction route">
              <div className="panel-heading">
                <div>
                  <h2>Deposit Route</h2>
                  <p>The split transfers immediately. Savings are held in the vault lock.</p>
                </div>
              </div>

              <div className="route-flow">
                <div className="route-node source">
                  <span>Deposit</span>
                  <strong>{formatUsdcx(preview.depositMicro)}</strong>
                </div>
                <div className="route-branch" aria-hidden="true" />
                <div className="route-results">
                  <div className="route-node saved-node">
                    <span>Locked savings</span>
                    <strong>{formatUsdcx(preview.savedMicro)}</strong>
                  </div>
                  <div className="route-node sent-node">
                    <span>Recipient payment</span>
                    <strong>{formatUsdcx(preview.sentMicro)}</strong>
                  </div>
                  <div className="route-node available-node">
                    <span>Vault available</span>
                    <strong>{formatUsdcx(preview.availableMicro)}</strong>
                  </div>
                </div>
              </div>

              <div className="timeline">
                <div className={flowPay.step === "strategy" ? "timeline-step active" : "timeline-step"}>
                  <span>1</span>
                  <p>Set strategy</p>
                </div>
                <div className={flowPay.step === "deposit" ? "timeline-step active" : "timeline-step"}>
                  <span>2</span>
                  <p>Deposit</p>
                </div>
                <div className={flowPay.success ? "timeline-step active" : "timeline-step"}>
                  <span>3</span>
                  <p>Result</p>
                </div>
              </div>

              <div className="lock-note">
                <span>Lock duration</span>
                <strong>{LOCK_DURATION_BLOCKS} blocks</strong>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
