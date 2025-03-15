import qs from "qs";
import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Stats from "./pages/Stats";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const storedToken = localStorage.getItem("access_token");

    console.log("Code from URL:", code);
    console.log("Stored Token:", storedToken);

    if (code && !storedToken) {
      exchangeCodeForToken(code);
      window.history.replaceState({}, document.title, "/"); // Clean up URL
    } else if (storedToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const exchangeCodeForToken = async (code: string) => {
    console.log("Exchanging code for token...");

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            btoa(
              `${import.meta.env.VITE_CLIENT_ID}:${import.meta.env.VITE_CLIENT_SECRET}`
            ),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: import.meta.env.VITE_REDIRECT_URI,
        }),
      });

      const data = await response.json();
      console.log("Token Response:", data);

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem(
          "expires_at",
          (Date.now() + data.expires_in * 1000).toString()
        );
        setIsAuthenticated(true);
      } else {
        console.error("Failed to get access token:", data);
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
    }
  };

  const handleLogin = () => {
    console.log("Redirecting to Spotify login...");
    const authUrl = `https://accounts.spotify.com/authorize?${qs.stringify({
      client_id: import.meta.env.VITE_CLIENT_ID,
      response_type: "code",
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      scope: "user-read-private user-read-email user-top-read user-library-read",
    })}`;
    window.location.href = authUrl;
  };

  return (
    <div className="w-full h-full">
      {isAuthenticated ? <Stats /> : <Landing handleLogin={handleLogin} isLoading={false} />}
    </div>
  );
}

export default App;
