import React, { useContext, useEffect, useRef, useState } from "react";

import LumangiLogo from "../assets/images/LumangiLogo.svg";
import RewardWheel from "../assets/images/RewardWheel.svg";

import Button from "../UI/Button";
import { useWeb3React } from "@web3-react/core";
import { useNavigate } from "react-router-dom";
import ConnectWallet from "./auth/ConnectWallet";
import { AuthContext, ActionTypes } from "../contexts/AuthContext";
import { ACCESS_TOKEN_LOCAL_STORAGE, WALLET_ADDRESS_LOCAL_STORAGE } from "../constants/common";
import useAuth from "../hooks/useAuth";
import { getEllipsisTxt } from "../utils/formatters";
// const style = {
//   position: "absolute" as "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   // width: 400,
//   p: 4,
// };

export function Header() {
  const { updateAuthAction, isAuthenticated, walletAddress } = useContext(AuthContext);
  const { account, connector } = useWeb3React();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const hasToken = !!window.localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE);
  const isLoggedIn = isAuthenticated || hasToken;

  const persistedAddress = window.localStorage.getItem(WALLET_ADDRESS_LOCAL_STORAGE);
  const buttonAddress = account || walletAddress || persistedAddress;

  const handleLogin = () => {
    updateAuthAction(ActionTypes.Login);
  }; 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [selectedWallet, setSelectedWallet] = useState<
    "MetaMask" | "WalletConnect" | "Coinbase" | null
  >(null);

  const goToProtected = (path: string) => {
    setIsUserMenuOpen(false);
    if (!isLoggedIn) {
      handleLogin();
      return;
    }
    navigate(path);
  };

  const openConnectWallet = () => {
    setIsUserMenuOpen(false);
    setIsAuthModalOpen(true);
  };
  useEffect(() => {
    if (account && selectedWallet) {
      setIsAuthModalOpen(false);
    }
  }, [account, selectedWallet]);

  useEffect(() => {
    if (!isUserMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsUserMenuOpen(false);
    };

    const onClick = (e: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [isUserMenuOpen]);

  const disconnectWallet = async () => {
    try {
      window.localStorage.removeItem("connectorId");
      if ((connector as any)?.deactivate) {
        (connector as any).deactivate();
      } else if ((connector as any)?.resetState) {
        (connector as any).resetState();
      }
      if ((connector as any)?.close) {
        await (connector as any).close();
      }
    } catch (_e) {
      // no-op
    }
  };

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);
      setIsAuthModalOpen(false);
      await disconnectWallet();
      logout();
      navigate("/");
    } catch (_e) {
      logout();
      navigate("/");
    }
  };

  useEffect(() => {
    if (!account) return;
    window.localStorage.setItem(WALLET_ADDRESS_LOCAL_STORAGE, account);
  }, [account]);

  useEffect(() => {
    if (account) return;
    const connectorId = window.localStorage.getItem("connectorId");
    if (!connectorId) {
      window.localStorage.removeItem(WALLET_ADDRESS_LOCAL_STORAGE);
    }
  }, [account]);

  return (
    <>
      <div className="relative z-[9999] flex items-center justify-between w-screen px-20 mt-5 mb-10">
        <div className="flex items-center">
          <div
            className="rounded-lg"
            style={{
              background: "linear-gradient(135deg, #414593 0%, #00022E 100%)",
              backgroundBlendMode: "hard-light",
            }}
          >
            {isAuthenticated && (
              <div className="flex h-full px-4 py-1">
                <img src={RewardWheel} alt="RewardWheel" className="" />

                <div className="self-end mx-2 text-xl text-white">
                  Bright Mba
                </div>
                <div className="px-1 text-xs text-white bg-[#5856D6] rounded-full h-fit">
                  Beginner
                </div>
              </div>
            )}
            <div className="w-full h-1 rounded-full bg-neutral-200 dark:bg-neutral-600">
              <div
                className="h-1 bg-[#FF073A] rounded-full "
                style={{ width: "45%" }}
              ></div>
            </div>
          </div>
          {isAuthenticated && (
            <div className="flex items-center justify-end px-2 py-1 ml-40 bg-white rounded-lg h-fit">
              <img src={RewardWheel} alt="RewardWheel" className="w-10 h-10" />
              <div className="flex flex-col w-full text-xs">
                <div>Next Roll:</div>
                <div>8h 13m 22s</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center self-center justify-self-center">
          <a className="w-full h-full" href="/">
            <img
              src={LumangiLogo}
              alt="logo"
              className="max-w-full ml-4 w-60 "
            />
          </a>
        </div>
        <div className="flex self-center justify-end space-x-4 justify-self-end ">
          <Button
            onClick={openConnectWallet}
            label={account ? getEllipsisTxt(account, 6) : "Connect Wallet"}
            color="dangerText"
            disabled={!!account}
            customStyle=" w-40 text-ellipsis overflow-hidden whitespace-nowrap "
            title={account || ""}
          />
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10"
              onClick={() => setIsUserMenuOpen((v) => !v)}
            >
              <span className="max-w-[12rem] overflow-hidden text-ellipsis whitespace-nowrap">
                {buttonAddress ? getEllipsisTxt(buttonAddress, 6) : isLoggedIn ? "Account" : "Menu"}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={isUserMenuOpen ? "rotate-180 transition-transform" : "transition-transform"}
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 z-[9999] mt-2 w-64 rounded-xl border border-white/10 bg-[rgba(34,51,123,0.85)] p-2 shadow-xl backdrop-blur-[60px] pointer-events-auto">
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-white hover:bg-white/10"
                  onClick={() => goToProtected("/profile")}
                >
                  Account
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-white hover:bg-white/10"
                  onClick={() => goToProtected("/settings")}
                >
                  Settings
                </button>

                {!isLoggedIn && (
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-white hover:bg-white/10"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogin();
                    }}
                  >
                    Register/Login
                  </button>
                )}

                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-white hover:bg-white/10"
                  onClick={() => goToProtected("/wallet")}
                  title={buttonAddress || ""}
                  disabled={!buttonAddress}
                >
                  Wallet: {buttonAddress ? getEllipsisTxt(buttonAddress, 6) : "Not connected"}
                </button>

                <div className="my-2 h-px bg-white/10" />
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-red-200 hover:bg-white/10"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <ConnectWallet
            isModalOpen={isAuthModalOpen}
            setIsModalOpen={setIsAuthModalOpen}
            setSelectedWallet={setSelectedWallet}
          />
        </div>
      </div>
    </>
  );
}

export default Header;
