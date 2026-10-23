#!/usr/bin/env python3
"""NEUROX V5/V6 artifact inventory. Python standard library only; does not execute model files."""
import argparse, hashlib, json, os, pathlib, struct, sys, datetime

MODEL_EXTENSIONS={".safetensors",".onnx",".pt",".pth",".bin",".gguf",".ckpt",".json",".tiktoken",".model"}
CONFIG_NAMES={"config.json","tokenizer_config.json","generation_config.json","model_config.json"}
DTYPE_BYTES={"F64":8,"F32":4,"F16":2,"BF16":2,"I64":8,"I32":4,"I16":2,"I8":1,"U8":1,"BOOL":1,"F8_E4M3":1,"F8_E5M2":1}
def sha256(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(4*1024*1024),b""):h.update(chunk)
    return h.hexdigest()
def inspect_safetensors(path):
    with path.open("rb") as f:
        header_size=struct.unpack("<Q",f.read(8))[0]
        if header_size>100_000_000: raise ValueError("Unreasonable safetensors header size")
        data=json.loads(f.read(header_size))
    tensors={k:v for k,v in data.items() if k!="__metadata__"}
    count=0; dtypes={}
    for k,v in tensors.items():
        n=1
        for dim in v["shape"]:n*=int(dim)
        count+=n
        dtypes[v["dtype"]]=dtypes.get(v["dtype"],0)+n
    return {"tensor_count":len(tensors),"parameter_count":count,"parameters_by_dtype":dtypes}
def inspect_config(path):
    obj=json.loads(path.read_text(encoding="utf-8"))
    keys=("model_type","architectures","vocab_size","hidden_size","num_hidden_layers","num_attention_heads","num_key_value_heads","intermediate_size","max_position_embeddings","n_layer","n_head","n_embd","block_size","rope_theta","torch_dtype")
    return {k:obj[k] for k in keys if k in obj}
def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("directory",type=pathlib.Path,help="Folder containing actual V5 or V6 files")
    ap.add_argument("--version",choices=["v5","v6"],required=True)
    ap.add_argument("--output",type=pathlib.Path,default=None)
    ap.add_argument("--no-hash",action="store_true",help="Skip SHA-256 for large files (preliminary scan only)")
    args=ap.parse_args()
    root=args.directory.resolve()
    if not root.is_dir():ap.error("Not a directory: "+str(root))
    records=[]; model_params=0; shards=0
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in MODEL_EXTENSIONS:continue
        rec={"relative_path":str(path.relative_to(root)).replace(os.sep,"/"),"size_bytes":path.stat().st_size}
        if not args.no_hash:rec["sha256"]=sha256(path)
        try:
            if path.suffix==".safetensors":
                rec["safetensors"]=inspect_safetensors(path)
                model_params+=rec["safetensors"]["parameter_count"]; shards+=1
            elif path.name in CONFIG_NAMES:rec["config_fields"]=inspect_config(path)
        except Exception as exc:rec["inspection_error"]=str(exc)
        records.append(rec)
    out={"version":args.version,"inspected_at_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"directory_name":root.name,
         "note":"Inventory and structural metadata only. Not proof of training or model quality.",
         "files":records,"safetensors_total_parameter_elements":model_params if shards else None,
         "safetensors_shards_inspected":shards}
    payload=json.dumps(out,indent=2,ensure_ascii=False)
    if args.output:args.output.write_text(payload+"\n",encoding="utf-8")
    else:print(payload)
    print(f"\n{args.version.upper()}: {len(records)} files; safetensors parameter elements: {model_params if shards else 'N/A'}",file=sys.stderr)
if __name__=="__main__":main()
