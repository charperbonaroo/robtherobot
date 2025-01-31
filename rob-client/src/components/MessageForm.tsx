import React from "react";
import { StaticForm } from "./StaticForm";
import { FormGroup } from "./FormGroup";

export function MessageForm(props: MessageForm.Props) {
  const onSubmit = (submit: StaticForm.Submit) => {
    if (props.disabled) return;
    props.onMessage(submit.object.message as string);
    submit.reset();
  };

  return <StaticForm onSubmit={onSubmit}>
    <FormGroup label="Message" htmlFor="message">
      <textarea disabled={props.disabled} className="form-control" id="message" name="message" />
    </FormGroup>
    <button disabled={props.disabled} type="submit" className="btn btn-primary">Send</button>
  </StaticForm>;
}

export namespace MessageForm {
  export interface Props {
    onMessage: (message: string) => void;
    disabled: boolean;
  }
}
