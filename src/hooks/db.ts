import { map } from "ramda";
import { useCallback, useState } from "react";
import { DbResult, getDbInstance } from "../db";
import { mapResultToObjects } from "../helpers";

export type QueryFormatter = (...a: any[]) => string;

interface QueryState<T> {
  loading: boolean;
  results: T[];
}

type SetQueryState<T> = React.Dispatch<React.SetStateAction<QueryState<T>>>;

type Parameters<T> = T extends (...args: infer T) => any ? T : never;

const initialState = {
  loading: false,
  results: [],
};

export function makeDbQuery<T>(formatter: QueryFormatter) {
  return () => {
    const [state, setState] = useState(initialState as QueryState<T>);
    const execQuery = useCallback(
      (...args: Parameters<typeof formatter>) => {
        setState({ loading: true, results: [] });
        performQuery({ formatter, setState }, args);
      },
      [state, setState]
    ) as (...args: Parameters<typeof formatter>) => void;

    return [state, execQuery] as [QueryState<T>, typeof execQuery];
  };
}

async function performQuery<T>(
  {
    formatter,
    setState,
  }: { formatter: QueryFormatter; setState: SetQueryState<T> },
  args: any[]
) {
  const dbExec = await getDbInstance();
  const res = await dbExec(formatter(...args));
  const { results } = res;

  if (results) {
    setState({
      results: processResults(results),
      loading: false,
    });
  } else {
    setState({
      results: [],
      loading: false,
    });
  }
}

const processResults = map(mapResultToObjects) as <T>(a: DbResult[]) => T[];
