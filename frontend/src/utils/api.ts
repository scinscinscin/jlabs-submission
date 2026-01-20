import Axios from "axios";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = Axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
const ipAxios = Axios.create({
  baseURL: "https://ipinfo.io/",
});

export async function checkLoginStatus() {
  const response = await api.get("/user/me");
  return response.data as { status: boolean };
}

export async function login(email: string, password: string) {
  const response = await api.post("/user/login", {
    email,
    password,
  });

  return response.data as { success: boolean };
}

export async function register(email: string, password: string) {
  const response = await api.post("/user/register", {
    email,
    password,
  });

  return response.data as { success: boolean };
}

export async function getIpData(ip?: string) {
  const response = await ipAxios.get((ip ? "/" + ip : "") + "/geo");
  return response.data as IPData;
}

export type IPData = {
  ip: string;
  hostname: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
  readme: string;
};

export const parseLocation = (location: string) => {
  const [latitude, longitude] = location.split(",");
  return { lat: parseFloat(latitude), lng: parseFloat(longitude) };
};
