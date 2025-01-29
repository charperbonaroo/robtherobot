import React from "react";

export function FormGroup(props: FormGroup.Props) {
  return <div className="mb-3">
    {props.label ? <label htmlFor={props.htmlFor} className="form-label">{props.label}</label> : null}
    {props.children}
    {props.formText ? <div className="form-text">{props.formText}</div> : null}
  </div>
}

export namespace FormGroup {
  export interface Props {
    htmlFor?: string;
    label?: React.ReactNode;
    children?: React.ReactNode;
    formText?: React.ReactNode;
  }
}
