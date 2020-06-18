import { getDbClient } from "./db";
import { converge, map, pipe, prop, objOf, zipObj } from "ramda";

export enum ResultType {
  EXACT,
  STEM,
  WILDCARD,
}

export interface SearchResultWord {
  type: ResultType;
  wordid: number;
  lemma: string;
}

export async function performSearch(query: string) {
  const { sql } = getDbClient();
  const { results } = await sql`
  SELECT min(type) AS type, wordid, lemma
  FROM (
    SELECT 0 as type, wordid, lemma
    FROM words
    WHERE lemma LIKE ${query}
    UNION
    SELECT 1 as type, wordid, lemma
    FROM words
    WHERE lemma LIKE ${query + "%"}
    UNION
    SELECT 2 as type, wordid, lemma
    FROM words
    WHERE lemma LIKE ${"%" + query + "%"}
  ) t
  GROUP BY wordid, lemma
  ORDER BY type
  LIMIT 1000`;

  if (results && results.length) {
    return mapResultToObjects(results[0]) as SearchResultWord[];
  }

  return null;
}

const mapResultToObjects = converge(map, [
  pipe(prop("columns"), zipObj),
  prop("values"),
]);
