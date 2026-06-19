/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import Auth from "../utils/auth";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // The access token may have expired since the last page load even though
      // the (httpOnly, unreadable-by-JS) refresh token is still good. Attempt a
      // silent refresh before concluding the user is actually logged out.
      let profile = null;
      if (Auth.loggedIn()) {
        profile = Auth.getProfile().data;
      } else if (await Auth.refreshAccessToken()) {
        profile = Auth.getProfile().data;
      }
      if (!cancelled) {
        setUser(profile);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// returns { user, isLoading }; user is null when logged out, otherwise
// { role, _id, group } decoded from the access token
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
