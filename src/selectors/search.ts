import { always, ifElse, isNil, path, pipe, head } from "ramda";
import { mapResultToObjects } from "../helpers";
import { SearchStateType } from "../reducers/search";
export const selectSearchState = path(["search", "type"]) as (
  s: any
) => SearchStateType;
export const selectSearchTerm = path(["search", "query"]) as (s: any) => string;
export const selectSearchResults = pipe(
  path(["search", "results"]),
  ifElse(isNil, always([]), pipe(head, mapResultToObjects))
);
