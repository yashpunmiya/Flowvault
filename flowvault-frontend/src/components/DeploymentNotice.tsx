"use client";

export function DeploymentNotice() {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-yellow-900/30 border-2 border-yellow-600/50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-3xl">⚠️</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">
              Contracts Not Deployed Yet
            </h3>
            <p className="text-gray-300 mb-4">
              Before you can use FlowVault, you need to deploy the smart contracts to Stacks testnet.
              The contracts are currently configured for local testing only.
            </p>
            
            <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700">
              <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
                Quick Deployment Steps:
              </h4>
              <ol className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">1.</span>
                  <span>Get testnet STX from the <a href="https://explorer.hiro.so/sandbox/faucet?chain=testnet" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Stacks Faucet</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">2.</span>
                  <span>Add your wallet mnemonic to <code className="text-yellow-400 bg-gray-800 px-2 py-0.5 rounded">settings/Testnet.toml</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">3.</span>
                  <span>Run deployment commands:</span>
                </li>
              </ol>
              
              <pre className="bg-black/50 p-3 rounded mt-3 overflow-x-auto">
                <code className="text-green-400 text-xs">
{`cd flowvault-contracts
clarinet deployments generate --testnet --medium-cost
clarinet deployments apply --testnet`}
                </code>
              </pre>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/hirosystems/clarinet/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                📥 Install Clarinet
              </a>
              <a
                href="https://explorer.hiro.so/sandbox/faucet?chain=testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                💰 Get Testnet STX
              </a>
              <a
                href="/DEPLOYMENT.md"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                📖 Full Deployment Guide
              </a>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              After deployment, update <code className="text-yellow-400">src/lib/contracts.ts</code> with your deployed contract addresses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
