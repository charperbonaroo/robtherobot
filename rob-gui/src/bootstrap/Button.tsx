import React from "react";
import { classNames } from "../util";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
}

export function Button(props: ButtonProps) {
  const className = classNames(props.className, `btn`,
    props.variant ? `btn-${props.variant}` : null);
  return <button {...props} className={className} />
}
