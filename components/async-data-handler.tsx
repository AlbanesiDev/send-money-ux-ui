import { ReactElement, ReactNode } from "react";

export enum STATUS {
  IDLE = "IDLE",
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  EMPTY = "EMPTY",
}

interface AsyncDataHandlerProps<T> {
  status: STATUS;
  data: T | null;
  idleComponent: ReactNode | ReactElement;
  loadingComponent: ReactNode | ReactElement;
  errorComponent: ReactNode | ReactElement;
  emptyComponent: ReactNode | ReactElement;
  successComponent: (data: T) => ReactNode | ReactElement;
}

export const AsyncDataHandler = <T,>({
  status,
  data,
  idleComponent,
  loadingComponent,
  errorComponent,
  emptyComponent,
  successComponent,
}: AsyncDataHandlerProps<T>) => {
  if (status === STATUS.IDLE) return <>{idleComponent}</>;
  if (status === STATUS.LOADING) return <>{loadingComponent}</>;
  if (status === STATUS.ERROR) return <>{errorComponent}</>;
  if (data === null || status === STATUS.EMPTY) return <>{emptyComponent}</>;
  if (Array.isArray(data) && data.length === 0) return <>{emptyComponent}</>;
  if (typeof data === "string" && data.trim() === "")
    return <>{emptyComponent}</>;
  return <>{successComponent(data)}</>;
};
