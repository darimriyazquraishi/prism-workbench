export type ModelCapability = 
  | 'vision' 
  | 'text_reasoning' 
  | 'code' 
  | 'embeddings' 
  | 'document_synthesis';

export interface ModelDescriptor {
  tag: string;
  name: string;
  capabilities: ModelCapability[];
  isDefault?: boolean;
}

export const LOCAL_MODEL_REGISTRY: ModelDescriptor[] = [
  {
    tag: 'qwen2.5vl:7b',
    name: 'Qwen 2.5 Vision Language (7B)',
    capabilities: ['vision', 'text_reasoning']
  },
  {
    tag: 'moondream:1.8b',
    name: 'Moondream Vision (1.8B)',
    capabilities: ['vision']
  },
  {
    tag: 'qwen3:8b',
    name: 'Qwen 3 General Reasoning (8B)',
    capabilities: ['text_reasoning', 'document_synthesis'],
    isDefault: true
  },
  {
    tag: 'qwen3:14b',
    name: 'Qwen 3 Reasoning (14B)',
    capabilities: ['text_reasoning', 'document_synthesis']
  },
  {
    tag: 'qwen3:32b',
    name: 'Qwen 3 Large Reasoning (32B)',
    capabilities: ['text_reasoning', 'document_synthesis']
  },
  {
    tag: 'qwen2.5-coder:7b',
    name: 'Qwen 2.5 Coder (7B)',
    capabilities: ['code', 'text_reasoning']
  },
  {
    tag: 'nomic-embed-text:latest',
    name: 'Nomic Embed Text (768-D)',
    capabilities: ['embeddings']
  }
];

export function resolveModelForCapability(
  capability: ModelCapability,
  preferredModel?: string
): ModelDescriptor {
  if (capability === 'vision') {
    return LOCAL_MODEL_REGISTRY.find(m => m.tag === 'qwen2.5vl:7b') || LOCAL_MODEL_REGISTRY[0];
  }
  if (capability === 'code') {
    return LOCAL_MODEL_REGISTRY.find(m => m.tag === 'qwen2.5-coder:7b') || LOCAL_MODEL_REGISTRY[5];
  }
  if (capability === 'embeddings') {
    return LOCAL_MODEL_REGISTRY.find(m => m.tag.includes('nomic')) || LOCAL_MODEL_REGISTRY[6];
  }
  if (capability === 'text_reasoning' || capability === 'document_synthesis') {
    if (preferredModel) {
      const match = LOCAL_MODEL_REGISTRY.find(m => m.tag === preferredModel || m.tag.startsWith(preferredModel));
      if (match && match.capabilities.includes('text_reasoning')) {
        return match;
      }
    }
    return LOCAL_MODEL_REGISTRY.find(m => m.isDefault) || LOCAL_MODEL_REGISTRY[2];
  }
  return LOCAL_MODEL_REGISTRY[2];
}

export function detectRequiredCapabilities(
  prompt: string,
  attachedFiles: string[] = [],
  uploadedFiles: { name: string; type?: string; extension?: string; dataUrl?: string }[] = []
): ModelCapability[] {
  const p = prompt.toLowerCase();
  const caps: Set<ModelCapability> = new Set();

  const hasImage = uploadedFiles.some(f => 
    (f.type === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(f.extension || '')) ||
    (f.dataUrl && f.dataUrl.startsWith('data:image'))
  ) || attachedFiles.some(f => /\.(png|jpg|jpeg|webp|gif|bmp)$/i.test(f));

  const asksForVision = /\b(ocr|scanned|read the image|inspect drawing|image analysis|photo|scanned report|novel|book|picture|image|photo|cover|diagram|chart)\b/.test(p);

  if (hasImage || asksForVision) {
    caps.add('vision');
  }

  if (/\b(python|script|code|docker|compute mtbf|calculate|math|formula|run code)\b/.test(p)) {
    caps.add('code');
  }

  if (/\b(sop|guidelines|company standard|knowledge base|retrieval|manual)\b/.test(p)) {
    caps.add('embeddings');
  }

  if (/\b(ppt|presentation|slides|excel|xlsx|word|docx|document|approval note|report)\b/.test(p)) {
    caps.add('document_synthesis');
  }

  caps.add('text_reasoning');

  return Array.from(caps);
}
