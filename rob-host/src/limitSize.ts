const LIMIT = 100_000;

export function limitSize(value: string) {
  if (value.length > LIMIT) {
    const lines = value.split(/\n/g);
    if (lines[lines.length - 1] == "")
      lines.pop();
    let start = "";
    let end = "";
    while (start.length + end.length < LIMIT) {
      start += lines.shift() + "\n";
      end = lines.pop() + "\n" + end;
    }
    return start + `# NOTE: ${lines.length} lines were omitted...\n` + end;
  }
  return value;
}
