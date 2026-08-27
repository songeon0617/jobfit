const TOKEN_PATTERN = /[a-z0-9](?:[a-z0-9+#.-]*[a-z0-9+#])?/gi;

export function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\r\n?/g, "\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  return (normalizeText(text).toLowerCase().match(TOKEN_PATTERN) ?? []).map(
    cleanToken,
  );
}

export function cleanToken(token: string): string {
  return token.replace(/^[.-]+|[.-]+$/g, "");
}

export function wordCount(text: string): number {
  return tokenize(text).length;
}

export function stemToken(token: string): string {
  if (/^(?:c\+\+|c#|node\.js)$/.test(token)) return token;
  if (token.length <= 4) return token;

  return token
    .replace(/ies$/, "y")
    .replace(/(sses|xes|ches|shes)$/, (ending) => ending.slice(0, -2))
    .replace(/ing$/, "")
    .replace(/ed$/, "")
    .replace(/s$/, "");
}

export function sentenceWords(text: string): string[][] {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => tokenize(sentence))
    .filter((words) => words.length > 0);
}
