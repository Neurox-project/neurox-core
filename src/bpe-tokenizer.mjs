/** Byte-level BPE tokenizer for models with tiktoken rank files.
 * No model-specific vocabulary or weights are bundled.
 */
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const toBytes = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
const toBase64 = bytes => btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
function concat(a,b) { const out=new Uint8Array(a.length+b.length);out.set(a);out.set(b,a.length);return out; }

export class BpeTokenizer {
  constructor(config, ranksText) {
    if (!config || !Number.isInteger(config.vocab_size) || !config.special_tokens || typeof ranksText !== 'string') throw new TypeError('Invalid tokenizer assets');
    this.vocabSize=config.vocab_size;
    this.special=config.special_tokens;
    this.ranks=new Map();
    this.tokenBytes=[];
    for (const line of ranksText.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const parts=line.trim().split(/\s+/);
      if (parts.length!==2 || !/^\d+$/.test(parts[1])) throw new Error('Invalid rank line');
      const [encoded,rankText]=parts;
      const rank=Number(rankText);
      if (!Number.isSafeInteger(rank) || rank<0 || rank>=this.vocabSize || this.ranks.has(encoded) || this.tokenBytes[rank]) throw new Error('Invalid or duplicate rank');
      this.ranks.set(encoded,rank);
      this.tokenBytes[rank]=toBytes(encoded);
    }
    if (!this.ranks.size) throw new Error('Empty tokenizer ranks');
    this.pattern=/'(?:[sSdDmMtT]|[lL][lL]|[vV][eE]|[rR][eE])|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,2}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]|\s+(?!\S)|\s+/gu;
  }
  encode(text) {
    if (typeof text!=='string') throw new TypeError('Expected text');
    const result=[];
    for (const match of text.matchAll(this.pattern)) {
      const bytes=encoder.encode(match[0]);
      const parts=Array.from(bytes,b=>Uint8Array.of(b));
      while (parts.length>1) {
        let best=Infinity,at=-1;
        for(let i=0;i<parts.length-1;i++){
          const rank=this.ranks.get(toBase64(concat(parts[i],parts[i+1])));
          if(rank!==undefined && rank<best){best=rank;at=i;}
        }
        if(at<0)break;
        parts.splice(at,2,concat(parts[at],parts[at+1]));
      }
      for(const part of parts){
        const id=this.ranks.get(toBase64(part));
        if(id===undefined)throw new Error('Tokenizer missing byte sequence');
        result.push(id);
      }
    }
    return result;
  }
  decode(ids) {
    if(!Array.isArray(ids))throw new TypeError('Expected token IDs');
    const parts=[];let length=0;
    for(const id of ids){const bytes=this.tokenBytes[id];if(bytes){parts.push(bytes);length+=bytes.length;}}
    const all=new Uint8Array(length);let offset=0;
    for(const part of parts){all.set(part,offset);offset+=part.length;}
    return decoder.decode(all);
  }
}
