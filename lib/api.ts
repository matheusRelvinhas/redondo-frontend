import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { getItem, setItem } from "./storage";


export function resolveBaseUrl(url: string) {
  if (Platform.OS === "web" || !url.includes("localhost")) return url;
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return host ? url.replace("localhost", host) : url;
}

const BASE_URL = resolveBaseUrl(process.env.EXPO_PUBLIC_BACKEND_URL ?? "");
const SERVICE_TOKEN = process.env.EXPO_PUBLIC_SERVICE_TOKEN;
const FRONTEND_URL = process.env.EXPO_PUBLIC_FRONTEND_URL ?? "";

const buildHeaders = (accessToken?: boolean) => {
  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
  };
  if (SERVICE_TOKEN) headers["X-Service-Token"] = SERVICE_TOKEN;

  if (Platform.OS !== "web" && FRONTEND_URL) {
    headers["Referer"] = `${FRONTEND_URL}/`;
  }

  const token = getItem("token_access");
  if (accessToken && token && token !== "not_user") {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleError = (error: any, errorCallback?: (error: any) => void) => {
  if (errorCallback) {
    errorCallback(error.response ? error.response.data : error);
  }
  if (error?.response?.data === "error_token") {
    setItem("token_access", "not_user");
  }
};

export const axiosGet = async (
  endpoint: string,
  callback: (data: any) => void,
  errorCallback?: (error: any) => void,
  accessToken?: boolean,
  timeout?: number
) => {
  try {
    const response = await axios.get(`${BASE_URL}/api${endpoint}`, {
      timeout: timeout || 20000,
      headers: buildHeaders(accessToken),
    });
    callback(response.data);
  } catch (error: any) {
    handleError(error, errorCallback);
  }
};

export const axiosPost = async (
  endpoint: string,
  data: any,
  callback: (data: any) => void,
  errorCallback?: (error: any) => void,
  accessToken?: boolean,
  timeout?: number
) => {
  try {
    const response = await axios.post(`${BASE_URL}/api${endpoint}`, data, {
      timeout: timeout || 20000,
      headers: buildHeaders(accessToken),
    });
    callback(response.data);
  } catch (error: any) {
    handleError(error, errorCallback);
  }
};
