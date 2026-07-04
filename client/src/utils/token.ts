const TOKEN_KEY = "evoke_token";

export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const saveUser = (user: any) => {
  localStorage.setItem("evoke_user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("evoke_user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("evoke_user");
};

export const isAuthenticated = () => {
  return !!getToken();
};