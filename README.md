# Npm

```tsx
npm install --save-exact @types/react-redux@7.1.15 axios@0.21.1 react-redux@7.2.2 redux@4.0.0 redux-thunk@2.3.0
```

# Process

1. action-types (constants for actions)
2. action (type, payload)
3. define reducers
4. combine reducers
5. define action-creators
6. (create store)
7. (export all)
8. (app.tsx)
9. (index.tsx) 

# Reducer setup

### (1) Define ActionType, `/state/action-types/index.ts`

- /state/action-types

```tsx
export enum ActionType {
  SEARCH_REPOSITORIES = "search_repositories",
  SEARCH_REPOSITORIES_SUCCESS = "search_repositories_success",
  SEARCH_REPOSITORIES_ERROR = "search_repositories_error",
}
```

### (2) Define Action, `/state/action/index.ts`

- Action is composed of `type` and `payload`

```tsx
import { ActionType } from "../action-types";

interface SearchRepositoriesAction {
  type: ActionType.SEARCH_REPOSITORIES;
}

interface SearchRepositoriesSuccessAction {
  type: ActionType.SEARCH_REPOSITORIES_SUCCESS;
  payload: string[];
}

interface SearchRepositoriesErrorAction {
  type: ActionType.SEARCH_REPOSITORIES_ERROR;
  payload: string;
}

export type Action =
  | SearchRepositoriesAction
  | SearchRepositoriesSuccessAction
  | SearchRepositoriesErrorAction;
```

### (3) Define Reducers, `/state/reducers/repositoriesReducer.ts`

```tsx
import { ActionType } from "../action-types";
import { Action } from "../actions";

interface RepositoriesState {
  loading: boolean;
  error: string | null;
  data: string[];
}

const initialState: RepositoriesState = {
  loading: false,
  error: null,
  data: [],
};

const reducer = (
  state: RepositoriesState = initialState,
  action: Action
): RepositoriesState => {
  switch (action.type) {
    case ActionType.SEARCH_REPOSITORIES:
      return { loading: true, error: null, data: [] };
    case ActionType.SEARCH_REPOSITORIES_SUCCESS:
      return { loading: false, error: null, data: action.payload };
    case ActionType.SEARCH_REPOSITORIES_ERROR:
      return { loading: false, error: action.payload, data: [] };
    default:
      return state;
  }
};

export default reducer;
```

### (4) Combine Reducers, `/state/reducers/index.ts`

```tsx
import { combineReducers } from "redux";
import repostitoriesReducer from "./repositoriesReducer";

const reducers = combineReducers({
  repositories: repostitoriesReducer,
});

export default reducers;
// for useTypedSelector
export type RootState = ReturnType<typeof reducers>;
```

### (5) Create `action-creators` , `/state/action-creators/index.ts`

```tsx
import axios from "axios";
import { Dispatch } from "redux";
import { ActionType } from "../action-types";
import { Action } from "../actions";

export const searchRepositories = (term: string) => {
  return async (dispatch: Dispatch<Action>) => {
    dispatch({
      type: ActionType.SEARCH_REPOSITORIES,
    });
    try {
      const { data } = await axios.get(
        "https://registry.npmjs.org/-/v1/search",
        {
          params: {
            text: term,
          },
        }
      );
      const names = data.objects.map((result: any) => {
        return result.package.name;
      });
      dispatch({
        type: ActionType.SEARCH_REPOSITORIES_SUCCESS,
        payload: names,
      });
    } catch (error) {
      if (error instanceof Error) {
        dispatch({
          type: ActionType.SEARCH_REPOSITORIES_ERROR,
          payload: error.message,
        });
      }
    }
  };
};
```

### (6) Create Store, `/state/store.ts`

```tsx
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import reducers from "./reducers";

export const store = createStore(reducers, {}, applyMiddleware(thunk));
```

### (7) Export all, `/state/index.ts`

```tsx
export * from "./store";
export * as actionCreators from "./action-creators";
export * from "./reducers"; // for useTypedSelector
```

### (8) app.tsx, wrap with provider

```tsx
import { Provider } from "react-redux";
import { store } from "../state";
import RepositoriesList from "./RepositoriesList";

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <h1>Search For a Pacakge</h1>
        <RepositoriesList />
      </div>
    </Provider>
  );
};

export default App;
```

### (9) index.tsx

```tsx
import ReactDOM from "react-dom";
import App from "./components/App";

ReactDOM.render(<App />, document.querySelector("#root"));
```

# Invoke Reducer

### Process

1. Define `useActions` to simplify code
2. Define `useTypedSelector.ts` to take advantage of typescript 

### (1) useActions

```tsx
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../state";

export const useActions = () => {
  const dispatch = useDispatch();
  return bindActionCreators(actionCreators, dispatch);
};
```

```tsx
const { searchRepositories } = useActions();
```

### (2) useTypedSelector

```tsx
import { useSelector, TypedUseSelectorHook } from "react-redux";
import { RootState } from "../state";

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```tsx
const { data, error, loading } = useTypedSelector(
  (state) => state.repositories
);
```

### (3) entire code

```tsx
import React from "react";
// import { useSelector } from "react-redux";
import { useTypedSelector } from "../hooks/useTypedSelector";
import { useState } from "react";
import { useActions } from "../hooks/useActions";
// import { useDispatch } from "react-redux";
// import { actionCreators } from "../state";

const RepositoriesList: React.FC = () => {
  const [term, setTerm] = useState("");
  /* Custom Hook to repalce useDispatch() */
  //   const dispatch = useDispatch();
  const { searchRepositories } = useActions();

  /*  Custom Hook to replace useSelector()  */
  //   const { data, error, loading } = useSelector(
  //     (state: any) => state.repositories
  //   ); // get state of repositories
  const { data, error, loading } = useTypedSelector(
    (state) => state.repositories
  );

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    /* Custom Hook to repalce useDispatch() */
    // dispatch(actionCreators.searchRepositories(term));
    searchRepositories(term);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input value={term} onChange={(e) => setTerm(e.target.value)} />
        <button>Search</button>
      </form>
      {error && <h3>{error}</h3>}
      {loading && <h3>Loading...</h3>}
      {!error && !loading && data.map((name) => <div key={name}>{name}</div>)}
    </div>
  );
};

export default RepositoriesList;
```
