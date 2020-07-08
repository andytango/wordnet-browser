import {
  equals,
  filter,
  identity,
  ifElse,
  is,
  length,
  map,
  pipe,
  propEq,
  useWith,
} from "ramda";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DbResult, formatSql, getDbInstance } from "../db";
import { mapResultToObjects } from "../helpers";
import { selectWordId } from "../selectors/location";
import { Word } from "./searchWord";

export interface WordSenseResult {
  synsetid: number;
  senseid: number;
  sensenum: number;
  pos: string;
  definition: string;
}

function formatWordQuery(wordid: number) {
  return formatSql`
  SELECT wordid, lemma
  FROM words
  WHERE wordid = ${wordid}`;
}

function formatWordSensesQuery(wordid: number) {
  return formatSql`
  SELECT synsetid, senseid, sensenum, pos, definition
  FROM senses
  JOIN synsets USING (synsetid)
  WHERE wordid = ${wordid}
  ORDER BY pos, sensenum
  `;
}

export interface SenseLinkResult {
  synsetid: number;
  synset2id: number;
  link: string;
  recurses: number;
  pos: string;
  definition: string;
}

function formatSenseLinksQuery(wordid: number) {
  return formatSql`
  WITH word_senses AS (
    SELECT synsetid
    FROM senses
    JOIN synsets USING (synsetid)
    WHERE wordid = ${wordid}
    ORDER BY pos, sensenum
  )
  SELECT 
    word_senses.synsetid,
    synset2id,
    link,
    recurses,
    synsets.pos,
    definition
  FROM semlinks
  JOIN linktypes USING (linkid)
  JOIN synsets ON synset2id = synsets.synsetid
  JOIN lexdomains USING (lexdomainid)
  JOIN word_senses 
    ON synset1id = word_senses.synsetid
  UNION
  SELECT 
    word_senses.synsetid,
    synset2id,
    link,
    recurses,
    synsets.pos,
    definition
  FROM lexlinks
  JOIN linktypes USING (linkid)
  JOIN synsets ON synset2id = synsets.synsetid
  JOIN lexdomains USING (lexdomainid)
  JOIN word_senses 
    ON synset1id = word_senses.synsetid
  ORDER BY word_senses.synsetid, link, recurses`;
}

interface WordLinkResult {
  synsetid: number;
  wordid: number;
  lemma: string;
}

function formatWordLinksQuery(wordid: number) {
  return formatSql`
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
  ORDER BY synsetid`;
}

export function useWordHierarchy() {
  const wordid = useSelector(selectWordId);

  const [wordHierarchy, setWordHierarchy] = useState(
    null as null | WordHierarchy
  );

  useEffect(() => {
    if (wordid) {
      getWordHierarchy(wordid).then(setWordHierarchy);
    }
  }, [wordid]);

  return wordHierarchy;
}

async function getWordHierarchy(wordid: number) {
  const dbExec = await getDbInstance();
  const { results } = await dbExec(
    [
      formatWordQuery(wordid),
      formatWordSensesQuery(wordid),
      formatSenseLinksQuery(wordid),
      formatWordLinksQuery(wordid),
    ].join(";\n")
  );

  if (areAllResultsPresent(results)) {
    return buildWordHierarchy(...parseResults(results));
  }

  return null;
}

const areAllResultsPresent = ifElse(
  is(Array),
  pipe(length, equals(4)),
  identity
) as (
  results: DbResult[] | undefined
) => results is [DbResult, DbResult, DbResult, DbResult];

function parseResults(
  res: [DbResult, DbResult, DbResult, DbResult]
): [[Word], WordSenseResult[], SenseLinkResult[], WordLinkResult[]] {
  return map(mapResultToObjects, res) as any;
}

function buildWordHierarchy(
  [word]: [Word],
  wordSenses: WordSenseResult[],
  senseLinks: SenseLinkResult[],
  wordLinks: WordLinkResult[]
) {
  return {
    ...word,
    dx: 0,
    dy: 0,
    children: map(addSenseLinks(senseLinks, wordLinks), wordSenses),
  };
}

type WordHierarchy = ReturnType<typeof buildWordHierarchy>;

const filterWithSynsetId = useWith(filter, [propEq("synsetid"), identity]);

function addSenseLinks(
  senseLinks: SenseLinkResult[],
  wordLinks: WordLinkResult[]
) {
  return (wordSense: WordSenseResult) => ({
    ...wordSense,
    dx: 0,
    dy: 0,
    children: map(
      addWordLinks(wordLinks),
      filterWithSynsetId(wordSense.synsetid, senseLinks)
    ),
  });
}

function addWordLinks(wordLinks: WordLinkResult[]) {
  return (senseLink: SenseLinkResult) => ({
    ...senseLink,
    dx: 0,
    dy: 0,
    children: filterWithSynsetId(senseLink.synset2id, wordLinks),
  });
}
