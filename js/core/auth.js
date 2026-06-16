export const AuthManager = {
  // Hardcoded untuk prototype (Nanti bisa diganti database)
  credentials: { username: "admin", password: "admin123" },

  login(username, password) {
    if (
      username === this.credentials.username &&
      password === this.credentials.password
    ) {
      localStorage.setItem("ds_admin_session", "active");
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem("ds_admin_session");
    window.location.href = "./login.html";
  },

  requireAuth() {
    const session = localStorage.getItem("ds_admin_session");

    if (session !== "active") {
      window.location.href = "./login.html";
    }
  },
};
