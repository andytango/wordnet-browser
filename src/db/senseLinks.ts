import { formatSql } from "../db";

export interface SenseLinkResult {
  synsetid: number;
  link: string;
  recurses: number;
  pos: string;
  definition: string;
}

export default function senseLinksQuery(synsetid: number) {
  return formatSql`
  SELECT synset2id AS synsetid,
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
  SELECT synset2id,
    link,
    recurses,
    synsets.pos,
    definition
  FROM lexlinks
  JOIN linktypes USING (linkid)
  JOIN synsets ON synset2id = synsetid
  JOIN lexdomains USING (lexdomainid)
  WHERE synset1id = ${synsetid}
  ORDER BY link, recurses;
  `;
}
