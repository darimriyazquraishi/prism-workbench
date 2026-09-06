import os
import json
import fitz  # PyMuPDF
from pathlib import Path

KNOWLEDGE_DIR = Path("/home/aidl/darim/prism-workbench/sovereign-ai-workbench/data/knowledge")
INDEX_FILE = KNOWLEDGE_DIR / "index.json"
PARSED_JSON_FILE = KNOWLEDGE_DIR / "parsed_knowledge.json"

def main():
    pdf_files = list(KNOWLEDGE_DIR.glob("*.pdf"))
    parsed_docs = []

    print(f"Found {len(pdf_files)} PDF files in {KNOWLEDGE_DIR}")

    for pdf_path in sorted(pdf_files):
        print(f"Processing: {pdf_path.name}")
        doc = fitz.open(pdf_path)
        pages_text = []
        for page_idx, page in enumerate(doc):
            t = page.get_text("text").strip()
            if t:
                pages_text.append(f"--- Page {page_idx + 1} ---\n{t}")
        doc.close()

        full_text = "\n\n".join(pages_text)
        parsed_docs.append({
            "id": f"kb-{pdf_path.stem}",
            "filename": pdf_path.name,
            "title": pdf_path.stem.replace("_", " "),
            "content": full_text,
            "sizeBytes": pdf_path.stat().st_size
        })

    with open(PARSED_JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(parsed_docs, f, indent=2)

    print(f"Successfully saved {len(parsed_docs)} parsed documents to {PARSED_JSON_FILE}")

if __name__ == "__main__":
    main()
