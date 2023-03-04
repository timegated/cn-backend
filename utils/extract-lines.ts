
export const extractLines = (data: Buffer): string[] =>
data
  .toString()
  .split("\n")
  .filter((line: string) => line.trim() !== "");