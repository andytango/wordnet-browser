import { path, pathOr, pipe } from "ramda";
import { Routes } from "../routes";

export const selectLocationType = path(["location", "type"]) as (
  s: any
) => Routes;

export const selectSearchFromUrl = pathOr("", [
  "location",
  "query",
  "search",
]) as (s: any) => string;

export const selectWordId = pipe(
  pathOr("-1", ["location", "payload", "wordid"]),
  parseInt
) as (s: any) => number;
