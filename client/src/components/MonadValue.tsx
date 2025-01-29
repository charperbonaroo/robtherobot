import React from "react";
import { Monad } from "../util/Monad";

export function MonadValue<T>(props: MonadValue.Props<T>) {
  if (Monad.isLoading(props))
    return <span>Loading...</span>;
  if (Monad.isError(props))
    return <span>Error: {props.error.message}</span>;
  if (Monad.isSuccess(props))
    return props.children(props.value);
}

export namespace MonadValue {
  export interface Props<T> extends Monad<T> {
    children: (value: T) => React.ReactNode;
  }
}
