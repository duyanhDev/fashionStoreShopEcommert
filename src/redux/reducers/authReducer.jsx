// src/redux/reducers/authReducer.jsx
import { LOGIN, LOGOUT } from "../actions/Auth";

const initialState = {
  token: null,
  user: null,
  refreshToken: null,
  isAuthenticated: false,
  accessTokenExpiredTime: null,
  refreshTokenExpiredTime: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        accessTokenExpiredTime: action.payload.accessTokenExpiredTime,
        refreshTokenExpiredTime: action.payload.refreshTokenExpiredTime,
        user: action.payload.user,
      };
    case LOGOUT:
      return {
        token: null,
        user: null,
        isAuthenticated: false,
        refreshToken: null,
        accessTokenExpiredTime: null,
        refreshTokenExpiredTime: null,
      };
    default:
      return state;
  }
};

export default authReducer;
