import axios, { type AxiosRequestHeaders } from "axios";

const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT!;
const apiBaseUrl =
  ENVIRONMENT === "prod"
    ? import.meta.env.VITE_PROD_SERVER_URL
    : ENVIRONMENT === "ngrok"
      ? import.meta.env.VITE_NGROK_SERVER_URL
      : import.meta.env.VITE_DEV_SERVER_URL;

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
});

// To allow proper API responses. Response gets text/html otherwise
if (ENVIRONMENT === "ngrok") {
  axiosInstance.interceptors.request.use((config) => {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    headers["ngrok-skip-browser-warning"] = "true";
    config.headers = headers;
    return config;
  });
}

export default axiosInstance;
