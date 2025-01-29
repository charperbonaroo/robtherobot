import React from "react";
import { StaticForm } from "./StaticForm";
import { FormGroup } from "./FormGroup";

export function MessageForm(props: MessageForm.Props) {
  const onSubmit = (submit: StaticForm.Submit) => {
    props.onMessage(submit.object.message as string);
    submit.reset();
  };

  return <StaticForm onSubmit={onSubmit}>
    <FormGroup label="Message" htmlFor="message">
      <textarea className="form-control" id="message" name="message" />
    </FormGroup>
    <button type="submit" className="btn btn-primary">Send</button>
  </StaticForm>;
}

export namespace MessageForm {
  export interface Props {
    onMessage: (message: string) => void;
  }
}
