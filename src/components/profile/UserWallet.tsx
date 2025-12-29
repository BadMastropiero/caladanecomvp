import React from "react";
import { useWeb3React } from "@web3-react/core";

import { getExplorer } from "../../constants/networks";
import { WALLET_ADDRESS_LOCAL_STORAGE } from "../../constants/common";
import { getEllipsisTxt } from "../../utils/formatters";

const UserWalletPage = () => {
  const { account, chainId } = useWeb3React();

  const persistedAddress = window.localStorage.getItem(WALLET_ADDRESS_LOCAL_STORAGE);
  const address = account || persistedAddress || "";

  const explorer = chainId ? getExplorer(chainId)?.[0] : undefined;

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
    } catch (_e) {
      // no-op
    }
  };

  return (
    <div className="w-full min-h-screen px-12 py-6 text-white">
      <h1 className="text-3xl font-bold">Wallet</h1>

      <div className="mt-6 max-w-2xl rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-gray-300">Wallet address</div>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-lg">
            {address ? getEllipsisTxt(address, 10) : "Not connected"}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10"
              onClick={copyAddress}
              disabled={!address}
            >
              Copy
            </button>
            {explorer && address && (
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10"
                onClick={() => window.open(`${explorer}/address/${address}`, "_blank")}
              >
                View on Explorer
              </button>
            )}
          </div>
        </div>

        {address && <div className="mt-3 break-all text-sm text-white/70">{address}</div>}
      </div>
    </div>
  );
};

export default UserWalletPage;
