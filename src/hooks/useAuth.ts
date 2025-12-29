import { useCallback, useEffect, useContext } from "react";
import { ACCESS_TOKEN_LOCAL_STORAGE, WALLET_ADDRESS_LOCAL_STORAGE } from "../constants/common";
import { getApi } from "../services/axios.service";
import { AuthContext } from "../contexts/AuthContext";
import { unwrapApiData } from "../utils/api";

const useAuth = () => {
  const { user, setUser, walletAddress, setWalletAddress, isAuthenticated, setIsAuthenticated } =
    useContext(AuthContext);

  // Simulate a login action
  const login = (data: any) => {
    const payload = unwrapApiData(data);
    // Perform login logic, set user data
    const token = payload?.access_token || payload?.authToken || "";
    const { access_token: accessTokenToExclude, authToken: authTokenToExclude, ...rest } = payload || {};
    setUser(payload?.user || { ...rest });
    if (token) {
      setIsAuthenticated(true);
      localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE, token);
    }

    const address = payload?.address || payload?.user?.address || rest?.address;
    if (address) {
      setWalletAddress(address);
      localStorage.setItem(WALLET_ADDRESS_LOCAL_STORAGE, address);
    }
  };

  // Simulate a logout action
  const logout = () => {
    // Perform logout logic, clear user data
    setUser(null);
    localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE);
    localStorage.removeItem(WALLET_ADDRESS_LOCAL_STORAGE);
    setWalletAddress(null);
    setIsAuthenticated(false);
  };

  const updateUserInfo = useCallback(async () => {
    const result = await getApi("/api/v1/users/me");
    const payload = unwrapApiData(result);
    setIsAuthenticated(true);
    setUser(payload as any);
    if ((payload as any)?.address) {
      setWalletAddress((payload as any).address);
      localStorage.setItem(WALLET_ADDRESS_LOCAL_STORAGE, (payload as any).address);
    }
  }, [setIsAuthenticated, setUser, setWalletAddress]);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE);
    if (token && !user) {
      (async () => {
        try {
          updateUserInfo();
        } catch (e) {
          console.log(e);
        }
      })();
    }
  }, [user, updateUserInfo]);

  return { user, walletAddress, login, logout, isAuthenticated, updateUserInfo };
};

export default useAuth;
