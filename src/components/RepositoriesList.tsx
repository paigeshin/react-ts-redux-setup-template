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
