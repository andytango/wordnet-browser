import { path } from "ramda";
import { SearchStateType } from "../reducers/search";
import { createQueryResultsSelector } from "./helpers";

export const selectSearchState = path(["search", "type"]) as (
  s: any
) => SearchStateType;
export const selectSearchTerm = path(["search", "query"]) as (s: any) => string;

export const selectSearchResults = createQueryResultsSelector([
  "search",
  "results",
]);
