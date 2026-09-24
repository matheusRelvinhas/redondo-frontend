export type InlineTone = "success" | "danger" | "tr" | null;

export interface InlinePart {
  text: string;
  bold: boolean;
  italic: boolean;
  tone: InlineTone;
}

export interface AiBlock {
  type: "paragraph" | "item";
  parts: InlinePart[];
}

const TONE_BY_CLASS: Record<string, InlineTone> = {
  "text-success": "success",
  "text-danger": "danger",
  "text-tr": "tr",
};

const stripTags = (html: string) =>
  html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");

const decode = (html: string) =>
  html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n");

function trimEdges(parts: InlinePart[]): InlinePart[] {
  if (!parts.length) return parts;

  const result = parts.map((p) => ({ ...p }));
  result[0].text = result[0].text.replace(/^\s+/, "");
  result[result.length - 1].text = result[result.length - 1].text.replace(/\s+$/, "");

  return result.filter((p) => p.text.length > 0);
}

function parseInline(html: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const regex = /<(strong|b|em|i)([^>]*)>([\s\S]*?)<\/\1>/gi;

  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    const before = decode(stripTags(html.slice(cursor, match.index)));
    if (before) parts.push({ text: before, bold: false, italic: false, tone: null });

    const classAttr = /class=['"]([^'"]*)['"]/i.exec(match[2]);
    const tone = classAttr
      ? (Object.entries(TONE_BY_CLASS).find(([cls]) => classAttr[1].includes(cls))?.[1] ??
        null)
      : null;

    const tag = match[1].toLowerCase();
    const emphasis = tag === "em" || tag === "i";
    const text = decode(stripTags(match[3]));
    if (text) parts.push({ text, bold: !emphasis, italic: emphasis, tone });

    cursor = match.index + match[0].length;
  }

  const rest = decode(stripTags(html.slice(cursor)));
  if (rest) parts.push({ text: rest, bold: false, italic: false, tone: null });

  return trimEdges(parts);
}

export function parseAiHtml(html: string): AiBlock[] {
  if (!html) return [];

  const blocks: AiBlock[] = [];
  const regex = /<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi;

  let match: RegExpExecArray | null;
  let matchedAny = false;

  while ((match = regex.exec(html))) {
    matchedAny = true;
    const parts = parseInline(match[2]);
    if (parts.length) {
      blocks.push({ type: match[1].toLowerCase() === "li" ? "item" : "paragraph", parts });
    }
  }

  if (!matchedAny) {
    const parts = parseInline(html);
    if (parts.length) blocks.push({ type: "paragraph", parts });
  }

  return blocks;
}

export const countWords = (blocks: AiBlock[]) =>
  blocks.reduce(
    (total, block) =>
      total + block.parts.reduce((n, part) => n + part.text.split(" ").length, 0),
    0
  );

export function sliceBlocks(blocks: AiBlock[], limit: number): AiBlock[] {
  if (limit <= 0) return [];

  const result: AiBlock[] = [];
  let used = 0;

  for (const block of blocks) {
    const parts: InlinePart[] = [];

    for (const part of block.parts) {
      const words = part.text.split(" ");
      if (used + words.length <= limit) {
        parts.push(part);
        used += words.length;
      } else {
        const remaining = limit - used;
        if (remaining > 0) {
          parts.push({ ...part, text: words.slice(0, remaining).join(" ") });
          used = limit;
        }
        break;
      }
    }

    if (parts.length) result.push({ ...block, parts });
    if (used >= limit) break;
  }

  return result;
}
