import { createQueryResultsSelector } from "./helpers";
import { SenseLinkResult } from "../db/senseLinks";
import { path } from "ramda";

export const selectActiveSense = path(["sense", "synsetid"]) as (
  s: any
) => number;

export const selectSenseLinks = createQueryResultsSelector([
  "sense",
  "results",
]) as (s: any) => SenseLinkResult[];
