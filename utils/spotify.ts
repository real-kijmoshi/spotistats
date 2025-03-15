import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Define the base Spotify API client
const spotify: AxiosInstance = axios.create({
  baseURL: "https://api.spotify.com/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Define interfaces for response data
interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}
interface Track {
  album: {
    images: { height: number; url: string; width: number }[];
    name: string;
    release_date: string;
  };
  artists: {
    name: string;
    id: string;
    genres?: string[];
    external_urls?: { spotify: string };
  }[];
  duration_ms: number;
  explicit: boolean;
  id: string;
  name: string;
  popularity: number;
  preview_url: string;
  uri: string;
  is_playable: boolean;
}

interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: { height: number; url: string; width: number }[];
  popularity: number;
  external_urls: { spotify: string };
  followers: { total: number };
}

interface User {
  display_name: string;
  images: { url: string }[];
  country: string;
  followers: { total: number };
  product: string;
}

// Function to refresh the access token
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    console.error("No refresh token found! User needs to reauthenticate.");
    return null;
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          btoa(
            `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`
          ),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data: AccessTokenResponse = await response.json();

    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem(
        "expires_at",
        (Date.now() + data.expires_in * 1000).toString()
      );
      return data.access_token;
    } else {
      console.error("Failed to refresh access token:", data);
      if (response.status === 400) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("expires_at");
      }
      return null;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

// Attach token interceptor for API requests
spotify.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem("access_token");
    const expiresAt = Number(localStorage.getItem("expires_at"));

    if (!token || Date.now() >= expiresAt) {
      console.warn("Access token expired! Refreshing...");
      token = await refreshAccessToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.error("No access token available!");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch user's top tracks
const getTracks = async (
  duration: string,
  limit: number = 50,
  offset: number = 0
): Promise<Track[]> => {
  try {
    const res = await spotify.get(
      `/me/top/tracks?time_range=${duration}&limit=${limit}&offset=${offset}`
    );
    return res.data.items;
  } catch (error: unknown) {
    console.error("Error fetching tracks:", (error as Error).message);
    throw error;
  }
};

// Fetch user profile
const me = async (): Promise<User> => {
  try {
    const res = await spotify.get("/me");
    return res.data;
  } catch (error: unknown) {
    console.error("Error fetching user info:", (error as Error).message);
    throw error;
  }
};

// Fetch top artists
const getTopArtists = async (
  duration: string,
  limit: number = 50
): Promise<Artist[]> => {
  try {
    const res = await spotify.get(
      `/me/top/artists?time_range=${duration}&limit=${limit}`
    );
    return res.data.items;
  } catch (error: unknown) {
    console.error("Error fetching top artists:", (error as Error).message);
    throw error;
  }
};

// Fetch track by ID
const getTrackById = async (
  trackId: string,
): Promise<Track> => {
  try {
    const res = await spotify.get(`/tracks/${trackId}`);
    return res.data;
  } catch (error: unknown) {
    console.error("Error fetching track:", (error as Error).message);
    throw error;
  }
};

export default {
  getTracks,
  getTopArtists,
  me,
  getTrackById,
};
