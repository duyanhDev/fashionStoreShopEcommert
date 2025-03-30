// src/redux/actions/authActions.jsx
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const SEARCH = "SEARCH";
export const login = (token, user) => ({
  type: LOGIN,
  payload: { token, user },
});

export const logout = () => ({
  type: LOGOUT,
});

export const Search = (data, totalpage) => (
  console.log(data),
  {
    type: SEARCH,
    payload: { data, totalpage },
  }
);
