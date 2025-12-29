import axios from "axios";
import { ACCESS_TOKEN_LOCAL_STORAGE, WALLET_ADDRESS_LOCAL_STORAGE } from "../constants/common";

const http = axios.create({
  baseURL: (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, ""),
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE);

  if (token) {
    config.headers = config.headers || {};
    const bearerToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    config.headers.Authorization = bearerToken;
  }

  return config;
});

http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error?.response?.status || error?.status;
    if (status === 401) {
      localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE);
      localStorage.removeItem(WALLET_ADDRESS_LOCAL_STORAGE);
      window.location.assign("/");
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export const getApi = (url: string) => {
  return http.get(url).then((res) => res.data);
};

export const postApi = (url: string, data: any) => {
  return http.post(url, data).then((res) => res.data);
};

export const putApi = (url: string, data: any) => {
  return http.put(url, data).then((res) => res.data);
};
