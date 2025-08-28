// ===== 3. AUTHENTICATION UTILITY (src/utils/auth.js) =====
// Create this new file for auth utilities
export class AuthService {
  static login(email, password) {
    return apiClient.auth.login(email, password);
  }

  static register(fullName, email, password, role = 'USER') {
    return apiClient.auth.register(fullName, email, password, role);
  }

  static logout() {
    apiClient.auth.logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  static isLoggedIn() {
    return apiClient.auth.isLoggedIn();
  }

  static getCurrentUser() {
    return apiClient.auth.getCurrentUser();
  }

  static requireAuth() {
    if (!this.isLoggedIn()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return false;
    }
    return true;
  }
}
