import { combineReducers } from "redux";
import repostitoriesReducer from "./repositoriesReducer";

const reducers = combineReducers({
  repositories: repostitoriesReducer,
});

export default reducers;
// for useTypedSelector
export type RootState = ReturnType<typeof reducers>;
