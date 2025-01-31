import React from "react";
import styles from "./StaticForm.module.css";

export function StaticForm(props: StaticForm.Props) {
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (props.onSubmit) {
      event.preventDefault();
      props.onSubmit(new StaticForm.Submit(event.target as HTMLFormElement));
    }
  };

  return <form className={styles.form} onSubmit={onSubmit}>{props.children}</form>
}

export namespace StaticForm {
  export interface Props {
    onSubmit?(submit: Submit): void;
    children?: React.ReactNode;
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
}
