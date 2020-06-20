import { formatSql } from "../db";

export interface WordSenseResult {
  synsetid: number;
  senseid: number;
  sensenum: number;
  pos: string;
  definition: string;
}

export default function wordSensesQuery(wordid: number) {
  return formatSql`
  SELECT synsetid, senseid, sensenum, pos, definition
  FROM senses
  JOIN synsets USING (synsetid)
  WHERE wordid = ${wordid}
  ORDER BY pos, sensenum
  `;
}
