import { combineReducers } from "redux";
import authReducer from "./authReducer";
import searchReducer from "./SearchReducer";
import { filterReducer } from "./filterReducer";
const rootReducer = combineReducers({
  auth: authReducer,
  search: searchReducer,
  filter: filterReducer,
});

export default rootReducer;
