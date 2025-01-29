import React from "react";
import { MonadResult } from "../util/MonadResult";

export function Monad<T>(props: Monad.Props<T>) {
  if (MonadResult.isLoading(props))
    return <span>Loading...</span>;
  if (MonadResult.isError(props))
    return <span>Error: {props.error.message}</span>;
  if (MonadResult.isSuccess(props))
    return props.children(props.value);
}

export namespace Monad {
  export interface Props<T> extends MonadResult<T> {
    children: (value: T) => React.ReactNode;
  }
}
