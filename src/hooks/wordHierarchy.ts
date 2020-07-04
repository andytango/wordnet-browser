import {
  defaultTo,
  filter,
  head,
  join,
  map,
  mergeRight,
  objOf,
  pipe,
  prop,
  propEq,
  propOr,
  zipWith,
} from "ramda";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { formatSql } from "../db";
import { Routes } from "../routes";
import { selectLocationType, selectWordId } from "../selectors/location";
import { makeDbQuery } from "./db";
import { Word } from "./searchWord";

export interface WordSenseResult {
  synsetid: number;
  senseid: number;
  sensenum: number;
  pos: string;
  definition: string;
}

const useWordQuery = makeDbQuery<Word>(
  (wordid: number) => formatSql`
  SELECT wordid, lemma
  FROM words
  WHERE wordid = ${wordid}
  `
);

const useWordSensesQuery = makeDbQuery<WordSenseResult>(
  (wordid: string) => formatSql`
  SELECT synsetid, senseid, sensenum, pos, definition
  FROM senses
  JOIN synsets USING (synsetid)
  WHERE wordid = ${wordid}
  ORDER BY pos, sensenum
  `
);

export interface SenseLinkResult {
  synsetid: number;
  link: string;
  recurses: number;
  pos: string;
  definition: string;
}

const useSenseLinksQuery = makeDbQuery<SenseLinkResult>(
  pipe(
    map(
      (synsetid: number) => formatSql`
      SELECT 
        synset2id AS synsetid,
        link,
        recurses,
        synsets.pos,
        definition
      FROM semlinks
      JOIN linktypes USING (linkid)
      JOIN synsets ON synset2id = synsetid
      JOIN lexdomains USING (lexdomainid)
      WHERE synset1id = ${synsetid}
      UNION
      SELECT 
        synset2id,
        link,
        recurses,
        synsets.pos,
        definition
      FROM lexlinks
      JOIN linktypes USING (linkid)
      JOIN synsets ON synset2id = synsetid
      JOIN lexdomains USING (lexdomainid)
      WHERE synset1id = ${synsetid}
      ORDER BY link, recurses;`
    ),
    join("\n")
  ) as (s: number[]) => string
);

interface WordLinkResult {
  synsetid: number;
  wordid: number;
  lemma: string;
}

const useWordLinksQuery = makeDbQuery<WordLinkResult>(
  pipe(
    (wordid: number) => formatSql`
    SELECT synsetid, wordid, lemma
    FROM (
        SELECT s2.synsetid
        FROM senses
        JOIN synsets s1 USING (synsetid)
        JOIN semlinks sl ON sl.synset1id = s1.synsetid
        JOIN linktypes USING (linkid)
        JOIN synsets s2 ON sl.synset2id = s2.synsetid
        JOIN lexdomains USING (lexdomainid)
        WHERE wordid = ${wordid}
        UNION ALL
        SELECT s2.synsetid
        FROM senses
        JOIN synsets s1 USING (synsetid)
        JOIN lexlinks sl ON sl.synset1id = s1.synsetid
        JOIN linktypes USING (linkid)
        JOIN synsets s2 ON sl.synset2id = s2.synsetid
        JOIN lexdomains USING (lexdomainid)
        WHERE wordid = ${wordid}
    ) t
    JOIN senses USING (synsetid)
    JOIN words USING (wordid)
    GROUP BY synsetid, wordid, lemma
    ORDER BY synsetid;`
  ) as (s: number) => string
);

const selectLemma = pipe(
  prop("results") as (r: any) => Word[],
  head,
  defaultTo([]) as (a: any) => [],
  head,
  defaultTo({}),
  propOr("", "lemma")
);

const selectSenseSynsetIds = pipe(
  prop("results") as (r: any) => WordSenseResult[],
  head,
  defaultTo([]) as (s: any) => [],
  map(prop("synsetid"))
);

const selectSenses = pipe(
  prop("results") as (r: any) => WordSenseResult[],
  head
) as (a: any) => WordSenseResult;

const selectSenseLinks = pipe(
  prop("results") as (r: any) => SenseLinkResult[][]
);

const selectWordLinks = pipe(
  prop("results") as (r: any) => WordLinkResult[],
  head
) as (a: any) => WordLinkResult[];

export function useWordHierarchy() {
  const wordid = useSelector(selectWordId);
  const [wordState, execWordQuery] = useWordQuery();
  const [sensesState, execSensesQuery] = useWordSensesQuery();
  const [senseLinksState, execSenseLinksQuery] = useSenseLinksQuery();
  const [wordLinkState, execWordLinksQuery] = useWordLinksQuery();
  const locationType = useSelector(selectLocationType);
  const shouldQuery = locationType === Routes.WORD;

  const lemma = useMemo(() => selectLemma(wordState), [wordState]);

  const senseSynsetIds = useMemo(() => selectSenseSynsetIds(sensesState), [
    sensesState,
  ]);

  const senses = useMemo(() => selectSenses(sensesState), [sensesState]);

  const senseLinks = useMemo(() => selectSenseLinks(senseLinksState), [
    senseLinksState,
  ]);

  const wordLinks = useMemo(() => selectWordLinks(wordLinkState), [
    wordLinkState,
  ]);

  useEffect(() => {
    if (shouldQuery && wordid) {
      execWordQuery(wordid);
      execWordLinksQuery(wordid);
      execSensesQuery(wordid);
    }
  }, [shouldQuery, wordid]);

  useEffect(() => {
    if (shouldQuery) {
      senseSynsetIds.length && execSenseLinksQuery(senseSynsetIds);
    }
  }, [senseSynsetIds]);

  return useMemo(() => {
    if (wordid && lemma && senses && senseLinks && wordLinks) {
      return {
        wordid,
        lemma,
        children: zipWith(
          mergeRight,
          senses,
          map(objOf("children"), map(lookUpWordLinks(wordLinks), senseLinks))
        ),
      };
    }

    return null;
  }, [wordid, lemma, senses, senseLinks, wordLinks]);
}

function lookUpWordLinks(wordLinks: WordLinkResult[]) {
  return (senseLinks: SenseLinkResult[]) =>
    map(
      (senseLink: SenseLinkResult) => ({
        ...senseLink,
        children: filter(
          propEq("synsetid", prop("synsetid", senseLink)),
          wordLinks
        ),
      }),
      senseLinks
    );
}
