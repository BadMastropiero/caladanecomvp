import React, { useState, createContext, useEffect } from "react";
import CustomModal from "../UI/CustomModal";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import ForgotPassword from "../components/auth/ForgotPassword";
import ChangePassword from "../components/auth/ChangePassword";
import { ACCESS_TOKEN_LOCAL_STORAGE, WALLET_ADDRESS_LOCAL_STORAGE } from "../constants/common";
import { getApi } from "../services/axios.service";

const unwrapApiData = (input: any) => {
  if (input && typeof input === "object" && "data" in input) {
    return (input as any).data;
  }
  return input;
};

export type AuthContextType = {
  user: IUser | null;
  setUser: any;
  walletAddress: string | null;
  setWalletAddress: any;
  isAuthenticated: boolean;
  setIsAuthenticated: any;
  toggleModal: any;
  setAuthAction: any;
  updateAuthAction: any;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  walletAddress: null,
  setWalletAddress: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  toggleModal: () => {},
  setAuthAction: () => {},
  updateAuthAction: () => {},
});

export const ActionTypes = {
  Login: "login",
  Register: "register",
  ForgotPassword: "forgot-password",
  ChangePassword: "change-password",
};

export type AuthActionType = {
  action: string;
  component: React.FC;
};

export const AuthActions: AuthActionType[] = [
  {
    action: ActionTypes.Login,
    component: Login,
  },
  {
    action: ActionTypes.Register,
    component: Register,
  },
  {
    action: ActionTypes.ForgotPassword,
    component: ForgotPassword,
  },
  {
    action: ActionTypes.ChangePassword,
    component: ChangePassword,
  },
];

export type IUser = {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  isVerified?: boolean;
  intro?: string;
};

const AuthContextProvider = ({ children }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [authAction, setAuthAction] = useState<AuthActionType | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem(WALLET_ADDRESS_LOCAL_STORAGE);
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE);
  });

  const Component = authAction?.component;

  const closeModal = () => {
    setShowModal(false);
    setAuthAction(null);
  };

  const toggleModal = (status: boolean | null = null) => {
    if (status !== null) {
      if (!status) {
        closeModal();
        return;
      }
      setShowModal(true);
      return;
    }

    setShowModal((prev) => {
      const next = !prev;
      if (!next) {
        setAuthAction(null);
      }
      return next;
    });
  };

  const updateAuthAction = (inputAction: string) => {
    setAuthAction(
      AuthActions.find(({ action }) => action === inputAction) as AuthActionType
    );
    setShowModal(true);
  };

  useEffect(() => {
    if (Component) {
      setShowModal(true);
    }
  }, [Component]);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE);
    if (!token) return;
    if (user) return;

    setIsAuthenticated(true);
    (async () => {
      try {
        const result: any = await getApi("/api/v1/users/me");
        const payload = unwrapApiData(result);
        setUser(payload as any);
        if (payload?.address) {
          setWalletAddress(payload.address);
          localStorage.setItem(WALLET_ADDRESS_LOCAL_STORAGE, payload.address);
        }
      } catch (e: any) {
        const status = e?.response?.status || e?.status;
        if (status === 401) {
          localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE);
          localStorage.removeItem(WALLET_ADDRESS_LOCAL_STORAGE);
          setUser(null);
          setWalletAddress(null);
          setIsAuthenticated(false);
        }
      }
    })();
  }, [user, walletAddress]);

  return (
    <>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          walletAddress,
          setWalletAddress,
          isAuthenticated,
          setIsAuthenticated,
          toggleModal,
          setAuthAction,
          updateAuthAction,
        }}
      >
        {children}
        <CustomModal
          body={Component ? <Component /> : <></>}
          handleClose={closeModal}
          open={showModal}
        />
      </AuthContext.Provider>
    </>
  );
};

export default AuthContextProvider;
