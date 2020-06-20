import { always, head, ifElse, isNil, path, pipe } from "ramda";
import { mapResultToObjects } from "../helpers";

export function createQueryResultsSelector(resPath: string[]) {
  return pipe(
    path(resPath),
    ifElse(isNil, always([]), pipe(head, mapResultToObjects))
  );
}
