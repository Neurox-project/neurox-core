// Browser-only GPT-style byte-level BPE for NEUROX V4.
// Uses tokenizer.tiktoken and tokenizer.json; no third-party tokenizer library.
const utf8 = new TextEncoder();
const decoder = new TextDecoder('utf-8');
const b64ToBytes = (b64) => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};
const bytesToB64 = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};
const join = (a, b) => {
  const result = new Uint8Array(a.length + b.length);
  result.set(a); result.set(b, a.length);
  return result;
};

export class NeuroxTokenizer {
  constructor(config, ranksText) {
    this.special = config.special_tokens;
    this.ranks = new Map();
    this.tokenBytes = [];
    for (const line of ranksText.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const [encoded, rankText] = line.trim().split(/\s+/);
      const rank = Number(rankText);
      if (!Number.isInteger(rank) || !encoded) throw new Error('Invalid tokenizer.tiktoken line');
      this.ranks.set(encoded, rank);
      this.tokenBytes[rank] = b64ToBytes(encoded);
    }
    // JS lacks possessive quantifiers and scoped inline case flags; this
    // equivalent regex handles the NEUROX tokenizer pattern for standard input text.
    this.pattern = /'(?:[sSdDmMtT]|[lL][lL]|[vV][eE]|[rR][eE])|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,2}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]|\s+(?!\S)|\s+/gu;
    this.vocabSize = config.vocab_size;
    this.specialById = new Map(Object.entries(this.special).map(([k, v]) => [v, k]));
    if (this.tokenBytes.length < 16000) throw new Error('Tokenizer ranks file appears incomplete');
  }
  encode(text) {
    const result = [];
    for (const match of text.matchAll(this.pattern)) {
      const bytes = utf8.encode(match[0]);
      let parts = Array.from(bytes, (byte) => Uint8Array.of(byte));
      while (parts.length > 1) {
        let best = Infinity, at = -1;
        for (let i = 0; i < parts.length - 1; i++) {
          const rank = this.ranks.get(bytesToB64(join(parts[i], parts[i + 1])));
          if (rank !== undefined && rank < best) { best = rank; at = i; }
        }
        if (at < 0) break;
        parts.splice(at, 2, join(parts[at], parts[at + 1]));
      }
      for (const part of parts) {
        const id = this.ranks.get(bytesToB64(part));
        if (id === undefined) throw new Error('Tokenizer missing byte sequence');
        result.push(id);
      }
    }
    return result;
  }
  decode(ids) {
    const parts = [];
    let length = 0;
    for (const id of ids) {
      const bytes = this.tokenBytes[id];
      if (!bytes) continue; // ignore special tokens
      parts.push(bytes); length += bytes.length;
    }
    const buffer = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) { buffer.set(part, offset); offset += part.length; }
    return decoder.decode(buffer);
  }
}