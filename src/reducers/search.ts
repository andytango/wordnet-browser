import { Action } from "redux";
import { isDbResultAction } from "../dbMiddleware";

export enum SearchActionType {
  SEARCH = "SEARCH",
  QUERY = "SEARCH_QUERY",
}

export enum SearchStateType {
  "WAITING" = "WAITING",
  "SEARCHING" = "SEARCHING",
  "COMPLETE" = "COMPLETE",
}

const initialState = {
  type: SearchStateType.WAITING,
  query: "",
};

type SearchState = typeof initialState;

interface SearchAction extends Action {
  type: SearchActionType;
  query: string;
}

export default function search(state = initialState, action: SearchAction) {
  switch (action.type) {
    case SearchActionType.QUERY:
      return processQuery(state, action);
    case SearchActionType.SEARCH:
      return processSearch(state, action);
    default:
      return state;
  }
}

function processQuery(state: SearchState, action: SearchAction) {
  if (action.query) {
    return { ...state, query: action.query };
  }

  return { type: SearchStateType.WAITING, query: action.query };
}

function processSearch(state: SearchState, action: SearchAction) {
  if (isDbResultAction(action)) {
    return {
      ...state,
      type: SearchStateType.COMPLETE,
      results: action.meta.results,
    };
  }

  return { ...state, type: SearchStateType.SEARCHING };
}
