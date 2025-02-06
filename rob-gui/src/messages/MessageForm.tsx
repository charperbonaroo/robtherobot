import React, { useEffect, useRef } from "react";
import { StaticForm } from "../forms";
import { classNames } from "../util";
import styles from "./MessageForm.module.css";
import { Button } from "../bootstrap";

export function MessageForm({ onMessage, disabled }: MessageForm.Props) {
  const textareaRef = useRef<HTMLTextAreaElement|null>(null);
  const submitRef = useRef<StaticForm.SubmitAction|null>(null);

  const resizeTextarea = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const onSubmit = (submit: StaticForm.Submit) => {
    if (disabled) return;

    const message = (submit.object.message as string).trim();
    if (message) onMessage(message);

    submit.reset();
    resizeTextarea();
  };

  useEffect(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;

    const onKeyPress = (event: KeyboardEvent) => {
      if (submitRef.current && event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitRef.current();
      }
    };

    textarea.addEventListener("input", resizeTextarea);
    textarea.addEventListener("keypress", onKeyPress);

    return () => {
      textarea.removeEventListener("input", resizeTextarea);
      textarea.removeEventListener("keypress", onKeyPress);
    };
  }, [textareaRef.current]);

  return <StaticForm submitRef={submitRef} onSubmit={onSubmit}>
    <div className="input-group">
      <textarea ref={textareaRef} name="message" rows={1}
        className={classNames("form-control", styles.textarea)} />
      <Button disabled={disabled} type="submit" variant="primary">Send</Button>
    </div>
  </StaticForm>;
}

export namespace MessageForm {
  export interface Props {
    onMessage: (message: string) => void;
    disabled: boolean;
  }
}
