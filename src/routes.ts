export enum Routes {
  ROOT = "ROOT",
  WORD = "WORD",
}

export const RoutesMap = {
  [Routes.ROOT]: "/",
  [Routes.WORD]: "/word/:wordid",
};
