export const setSession = (data) => {
  sessionStorage.setItem('session', JSON.stringify(data));
};

export const getSession = () => {
  const raw = sessionStorage.getItem('session');
  return raw ? JSON.parse(raw) : null;
};

export const clearSession = () => {
  sessionStorage.removeItem('session');
};

export const isAuthenticated = () => !!getSession()?.token;


export const getUser = () => getSession()?.user;

export const getRole = () => getSession()?.user?.role;
