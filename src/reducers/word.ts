import { Action } from "redux";
import { DbResultMeta } from "../dbMiddleware";
import { WordSenseResult } from "../db/wordSenses";
import { DbResult } from "../db";

export enum WordActionType {
  CLEAR = "WORD_CLEAR",
  SELECT = "WORD_SELECT",
}

export interface Word {
  wordid: number;
  lemma: string;
}

interface WordAction extends Action {
  type: WordActionType;
  word: Word;
  meta?: DbResultMeta;
}

const initialState = { wordid: -1, lemma: "" } as WordState;

interface WordState extends Word {
  results?: [];
}

export default function word(state = initialState, action: WordAction) {
  switch (action.type) {
    case WordActionType.SELECT:
      return processWordSelect(state, action);
    case WordActionType.CLEAR:
      return initialState;
    default:
      return state;
  }
}

function processWordSelect(state: WordState, action: WordAction) {
  if (action.meta) {
    return { ...state, ...action.word, results: action.meta.results };
  }

  return { ...state, ...action.word };
}
