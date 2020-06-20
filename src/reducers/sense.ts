import { Action } from "redux";
import { DbResultMeta } from "../dbMiddleware";
import { WordActionType, WordAction } from "./word";

export enum SenseActionType {
  SELECT = "SENSE_SELECT",
  CLEAR = "SENSE_CLEAR",
}

export interface SenseAction extends Action {
  type: SenseActionType;
  synsetid: number;
  meta?: DbResultMeta;
}

const initialState = { synsetid: -1 } as SenseState;

interface SenseState {
  synsetid: number;
  results?: [];
}

export default function sense(
  state = initialState,
  action: SenseAction | WordAction
) {
  switch (action.type) {
    case SenseActionType.SELECT:
      return processWordSelect(state, action);
    case SenseActionType.CLEAR:
      return initialState;
    case WordActionType.CLEAR:
      return initialState;
    default:
      return state;
  }
}

function processWordSelect(state: SenseState, action: SenseAction) {
  const { synsetid } = action;
  if (action.meta) {
    return { ...state, synsetid, results: action.meta.results };
  }

  return { ...state, synsetid };
}
