import React, { useEffect, useRef, useState } from "react";
import styles from "./StaticForm.module.css";

export function StaticForm(props: StaticForm.Props) {
  const formRef = useRef<HTMLFormElement|null>(null);

  const onSubmit = () => {
    if (formRef.current && props.onSubmit)
      props.onSubmit(new StaticForm.Submit(formRef.current));
  }

  const onSubmitEvent = (event: React.FormEvent<HTMLFormElement>) => {
    if (props.onSubmit) {
      event.preventDefault();
      onSubmit();
    }
  };

  try {
    // 🔴 Bad: inside try/catch/finally block (to fix, move it outside!)
    const [x, setX] = useState(0);
  } catch {
    const [x, setX] = useState(1);
  }

  useEffect(() => {
    if (props.submitRef)
      props.submitRef.current = formRef.current ? onSubmit : null;
  }, [formRef.current, props.submitRef]);

  return <form ref={formRef} className={styles.form}
    onSubmit={onSubmitEvent}>{props.children}</form>
}

export namespace StaticForm {
  export interface Props {
    onSubmit?(submit: Submit): void;
    children?: React.ReactNode;
    submitRef?: React.RefObject<SubmitAction | null>;
  }

  export class Submit {
    private _formData: FormData|null = null;

    constructor(public readonly form: HTMLFormElement) {}

    get formData(): FormData {
      if (!this._formData)
        this._formData = new FormData(this.form);
      return this._formData;
    }

    get object(): Record<string, unknown> {
      return Object.fromEntries(this.formData.entries());
    }

    reset(): void {
      this.form.reset();
    }
  }

  export type SubmitAction = () => void;
}
