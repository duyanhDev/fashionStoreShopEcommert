// src/redux/actions/authActions.jsx
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const SEARCH = "SEARCH";
export const UPDATE_USER = "UPDATE_USER";
export const login = (
  token,
  user,
  refreshToken,
  accessTokenExpiredTime,
  refreshTokenExpiredTime
) => ({
  type: LOGIN,
  payload: {
    token,
    user,
    refreshToken,
    accessTokenExpiredTime,
    refreshTokenExpiredTime,
  },
});

export const logout = () => ({
  type: LOGOUT,
});

export const Search = (data, totalpage) => ({
  type: SEARCH,
  payload: { data, totalpage },
});

export const updateUser = (user) => ({
  type: UPDATE_USER,
  payload: user,
});
