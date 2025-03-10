import { realpathSync, mkdirSync } from "node:fs";

export function ensureWorkingDirectory(directory?: string | undefined): string {
  if (!directory)
    throw new Error("No directory provided");

  mkdirSync(directory, { recursive: true });
  return realpathSync(directory);
}
