import axios from "axios";

const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT!;
const apiBaseUrl =
  ENVIRONMENT === "prod"
    ? import.meta.env.VITE_PROD_SERVER_URL
    : import.meta.env.VITE_DEV_SERVER_URL;

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
});

export default axiosInstance;
