import { path } from "ramda";
import { createQueryResultsSelector } from "./helpers";
import { WordSenseResult } from "../db/wordSenses";

export const selectWordLemma = path(["word", "lemma"])

export const selectWordSenses = createQueryResultsSelector([
  "word",
  "results",
]) as (s: any) => WordSenseResult[];