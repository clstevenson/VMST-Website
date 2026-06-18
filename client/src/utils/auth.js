// use this to decode a token and get the user's information out of it
import { jwtDecode } from "jwt-decode";

const TOKEN_COOKIE = "access_token";

// create a new class to instantiate for a user
class AuthService {
  // get user data
  getProfile() {
    return jwtDecode(this.getToken());
  }

  // check if user's logged in
  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    // login status returned
    return !!token && !this.isTokenExpired(token);
  }

  // check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      // malformed token can't be trusted, treat as expired
      return true;
    }
  }

  getToken() {
    // Retrieves the access token from its (non-httpOnly) cookie
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
    return match ? match[1] : null;
  }

  // store the access token as a cookie, expiring at the same time as the JWT itself
  setToken(token) {
    const { exp } = jwtDecode(token);
    const expires = new Date(exp * 1000).toUTCString();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${TOKEN_COOKIE}=${token}; expires=${expires}; path=/; SameSite=Strict${secure}`;
  }

  // ask the server for a new access token using the httpOnly refresh cookie
  // returns the new token on success, or null if the refresh token is missing/expired
  async refreshAccessToken() {
    try {
      const res = await fetch("/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const { accessToken } = await res.json();
      this.setToken(accessToken);
      return accessToken;
    } catch {
      return null;
    }
  }

  login(idToken) {
    this.setToken(idToken);
    window.location.assign("/me");
  }

  logout() {
    // Clear the access token cookie
    document.cookie = `${TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    window.location.assign("/");
  }
}

export default new AuthService();
