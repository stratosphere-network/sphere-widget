import axios from "axios";

const BASE_URL =
  "https://stratosphere-network-tendermint-production.up.railway.app";

// API response interface matching the backend model
export interface RequestLinkRedirect {
  url: string;
  telegram_url?: string;
  mobile_url?: string;
  project_api_key: string;
  createdAt: string;
  updatedAt: string;
}

// API request interface
interface GetRedirectLinksRequest {
  project_api_key: string;
}

// Create axios instance with base configuration
const sphereApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Get redirect links from the backend
export const getRedirectLinks = async (): Promise<RequestLinkRedirect> => {
  try {
    const apiKey = import.meta.env.VITE_PROJECT_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Project API key not found. Please set VITE_PROJECT_API_KEY in your .env file"
      );
    }

    const requestData: GetRedirectLinksRequest = {
      project_api_key: apiKey,
    };

    const response = await sphereApi.post<RequestLinkRedirect>(
      "/project/get-redirect-links",
      requestData
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching redirect links:", error);
    throw error;
  }
};

// Add request interceptor for debugging
sphereApi.interceptors.request.use(
  (config) => {
    console.log("Making API request:", {
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
sphereApi.interceptors.response.use(
  (response) => {
    console.log("API response received:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    return Promise.reject(error);
  }
);

export default sphereApi;
