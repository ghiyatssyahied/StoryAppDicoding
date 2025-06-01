const AUTH_KEY = 'auth';

const Auth = {
  setAuth({ userId, name, token }) {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        userId,
        name,
        token,
      }),
    );
  },

  getAuth() {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
  },

  destroyAuth() {
    localStorage.removeItem(AUTH_KEY);
  },

  isAuthenticated() {
    const auth = this.getAuth();
    return !!auth.token;
  },
};

export default Auth;