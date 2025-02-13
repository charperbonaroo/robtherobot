export namespace TextAreas {
  export function autogrow(textarea: HTMLTextAreaElement) {
    textarea.style.overflow = "hidden";
    textarea.style.resize = "none";

    const resizeTextarea = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener("input", resizeTextarea);

    const form = textarea.form;
    form?.addEventListener("reset", resizeTextarea);

    return () => {
      textarea.removeEventListener("input", resizeTextarea);
      form?.removeEventListener("reset", resizeTextarea);
    };
  }

  export function onEnter(textarea: HTMLTextAreaElement, callback: () => void) {
    const onKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        callback();
      }
    };

    textarea.addEventListener("keypress", onKeyPress);

    return () => {
      textarea.removeEventListener("keypress", onKeyPress);
    };
  }
}
