import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_SYNC_URL ?? "",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("clerk-db-jwt");
  if (token) {
    config.headers.setAuthorization(`${token}`);
  }

  return config;
});

export default instance;
