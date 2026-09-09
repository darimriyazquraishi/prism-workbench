import React, { useState } from 'react';
import { marked, type Token } from 'marked';
import { Check, Copy, Terminal, ChevronDown, ChevronRight, Download, FileCode } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const cleanCode = code.replace(/\r\n/g, '\n').trimEnd();
  const lineCount = cleanCode.split('\n').length;
  const langDisplay = language ? language.toLowerCase() : 'code';

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      const ta = document.createElement('textarea');
      ta.value = cleanCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const extMap: Record<string, string> = {
      python: 'py',
      py: 'py',
      javascript: 'js',
      js: 'js',
      typescript: 'ts',
      ts: 'ts',
      html: 'html',
      css: 'css',
      json: 'json',
      sql: 'sql',
      bash: 'sh',
      sh: 'sh',
      powershell: 'ps1',
      csharp: 'cs',
      cs: 'cs',
      cpp: 'cpp',
      c: 'c',
      rust: 'rs',
      rs: 'rs',
      go: 'go'
    };
    const ext = extMap[langDisplay] || 'txt';
    const blob = new Blob([cleanCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-3.5 rounded-xl border border-[var(--border-subtle)] bg-[#0d1117] overflow-hidden shadow-md text-xs font-mono select-none">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-[#30363d]/60">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[11px] font-semibold tracking-wider text-[#7d8590] uppercase">
            {langDisplay}
          </span>
          <span className="text-[10px] text-[#484f58] font-mono px-1.5 py-0.5 rounded bg-[#21262d]">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white transition-colors cursor-pointer text-[11px]"
            title="Download script file"
          >
            <Download className="w-3 h-3 text-[#7d8590]" />
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white transition-colors cursor-pointer text-[11px] shadow-sm font-sans font-medium"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#7d8590]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Line Numbers & Syntax Highlighting */}
      <div className="p-3.5 overflow-x-auto text-[12.5px] leading-relaxed text-[#e6edf3] font-mono select-text bg-[#0d1117]">
        <div className="table w-full border-collapse">
          {renderHighlightedCode(cleanCode)}
        </div>
      </div>
    </div>
  );
};

function renderHighlightedCode(code: string): React.ReactNode {
  const lines = code.split('\n');
  const tokenRegex = /(#.*$|\/\/.*$|f?"""[\s\S]*?"""|f?'''[\s\S]*?'''|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*'|\b(?:def|class|return|if|elif|else|for|while|in|import|from|as|try|except|finally|raise|with|lambda|pass|break|continue|yield|function|const|let|var|async|await|new|typeof|interface|type|public|private|static|export|default|null|true|false|True|False|None)\b|\b\d+(?:\.\d+)?\b|\b(?:print|len|range|int|float|str|bool|dict|list|set|tuple|input|super|isinstance|enumerate|zip|map|filter|sum|min|max|abs|round|open|console|log|error|warn)\b|[a-zA-Z_]\w*(?=\s*\())/g;

  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
      return (
        <div key={lineIdx} className="table-row hover:bg-[#161b22]/50 transition-colors">
          <span className="table-cell select-none pr-4 text-right text-[#484f58] font-mono text-[11px] w-8 border-r border-[#21262d] mr-3">
            {lineIdx + 1}
          </span>
          <span className="table-cell pl-3 text-[#8b949e] italic whitespace-pre">{line}</span>
        </div>
      );
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        elements.push(line.slice(lastIndex, match.index));
      }

      const matchText = match[0];
      if (matchText.startsWith('#') || matchText.startsWith('//')) {
        elements.push(<span key={match.index} className="text-[#8b949e] italic">{matchText}</span>);
      } else if (matchText.startsWith('"') || matchText.startsWith("'") || matchText.startsWith('f"') || matchText.startsWith("f'")) {
        elements.push(<span key={match.index} className="text-[#a5d6ff]">{matchText}</span>);
      } else if (/^\d/.test(matchText)) {
        elements.push(<span key={match.index} className="text-[#79c0ff]">{matchText}</span>);
      } else if (/^(?:def|class|return|if|elif|else|for|while|in|import|from|as|try|except|finally|raise|with|lambda|pass|break|continue|yield|function|const|let|var|async|await|new|typeof|interface|type|public|private|static|export|default|null|true|false|True|False|None)$/.test(matchText)) {
        elements.push(<span key={match.index} className="text-[#ff7b72] font-semibold">{matchText}</span>);
      } else if (/^(?:print|len|range|int|float|str|bool|dict|list|set|tuple|input|super|isinstance|enumerate|zip|map|filter|sum|min|max|abs|round|open|console|log|error|warn)$/.test(matchText)) {
        elements.push(<span key={match.index} className="text-[#7ee787]">{matchText}</span>);
      } else {
        elements.push(<span key={match.index} className="text-[#d2a8ff]">{matchText}</span>);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      elements.push(line.slice(lastIndex));
    }

    return (
      <div key={lineIdx} className="table-row hover:bg-[#161b22]/50 transition-colors">
        <span className="table-cell select-none pr-4 text-right text-[#484f58] font-mono text-[11px] w-8 border-r border-[#21262d] mr-3">
          {lineIdx + 1}
        </span>
        <span className="table-cell pl-3 whitespace-pre">{elements.length > 0 ? elements : line}</span>
      </div>
    );
  });
}

function renderInlineTokens(tokens?: Token[]): React.ReactNode {
  if (!tokens || tokens.length === 0) return null;

  return tokens.map((token, index) => {
    switch (token.type) {
      case 'strong':
        return (
          <strong key={index} className="font-semibold text-[var(--text-primary)]">
            {renderInlineTokens(token.tokens)}
          </strong>
        );
      case 'em':
        return (
          <em key={index} className="italic text-[var(--text-primary)]">
            {renderInlineTokens(token.tokens)}
          </em>
        );
      case 'codespan':
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded font-mono text-[12px] bg-[var(--bg-elevated)] text-cyan-400 border border-[var(--border-subtle)] font-medium select-text"
          >
            {token.text}
          </code>
        );
      case 'link':
        return (
          <a
            key={index}
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
          >
            {renderInlineTokens(token.tokens) || token.text}
          </a>
        );
      case 'del':
        return (
          <del key={index} className="line-through text-[var(--text-tertiary)]">
            {renderInlineTokens(token.tokens)}
          </del>
        );
      case 'text':
        return token.tokens ? (
          <React.Fragment key={index}>{renderInlineTokens(token.tokens)}</React.Fragment>
        ) : (
          token.text
        );
      case 'escape':
        return token.text;
      default:
        return (token as any).text || (token as any).raw || null;
    }
  });
}

function renderBlockToken(token: Token, index: number): React.ReactNode {
  switch (token.type) {
    case 'code':
      return <CodeBlock key={index} language={token.lang || ''} code={token.text} />;

    case 'heading': {
      const headingClass =
        token.depth === 1
          ? 'text-lg font-bold text-[var(--text-primary)] mt-5 mb-2 pb-1.5 border-b border-[var(--border-subtle)]'
          : token.depth === 2
          ? 'text-base font-semibold text-[var(--text-primary)] mt-4 mb-2 pb-1 border-b border-[var(--border-subtle)]/50'
          : token.depth === 3
          ? 'text-sm font-semibold text-cyan-400 mt-3.5 mb-1.5'
          : 'text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mt-3 mb-1';

      const Tag = (`h${Math.min(token.depth, 6)}`) as keyof JSX.IntrinsicElements;
      return (
        <Tag key={index} className={headingClass}>
          {token.tokens ? renderInlineTokens(token.tokens) : token.text}
        </Tag>
      );
    }

    case 'paragraph':
      return (
        <p key={index} className="my-2 text-[13px] leading-relaxed text-[var(--text-primary)] select-text">
          {token.tokens ? renderInlineTokens(token.tokens) : token.text}
        </p>
      );

    case 'list': {
      const ListTag = token.ordered ? 'ol' : 'ul';
      const listClass = token.ordered
        ? 'my-2.5 pl-5 space-y-1.5 list-decimal marker:text-cyan-400 marker:font-mono text-[13px] text-[var(--text-primary)] leading-relaxed'
        : 'my-2.5 pl-5 space-y-1.5 list-disc marker:text-cyan-400/80 text-[13px] text-[var(--text-primary)] leading-relaxed';

      return (
        <ListTag key={index} className={listClass} start={token.start || undefined}>
          {token.items.map((item, itemIdx) => (
            <li key={itemIdx} className="leading-relaxed select-text">
              {item.tokens ? (
                item.tokens.map((subToken, subIdx) => {
                  if (subToken.type === 'text') {
                    return (
                      <React.Fragment key={subIdx}>
                        {subToken.tokens ? renderInlineTokens(subToken.tokens) : subToken.text}
                      </React.Fragment>
                    );
                  }
                  return renderBlockToken(subToken, subIdx);
                })
              ) : (
                item.text
              )}
            </li>
          ))}
        </ListTag>
      );
    }

    case 'blockquote':
      return (
        <blockquote
          key={index}
          className="my-3 border-l-2 border-cyan-500/70 pl-3.5 py-1.5 bg-cyan-950/10 rounded-r-lg text-xs italic text-[var(--text-secondary)]"
        >
          {token.tokens ? token.tokens.map(renderBlockToken) : token.text}
        </blockquote>
      );

    case 'hr':
      return <hr key={index} className="my-4 border-t border-[var(--border-subtle)]" />;

    case 'table':
      return (
        <div key={index} className="my-3 overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-primary)]">
              <tr>
                {token.header.map((col, colIdx) => (
                  <th key={colIdx} className="p-2.5 font-semibold">
                    {col.tokens ? renderInlineTokens(col.tokens) : col.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]/40 text-[var(--text-secondary)]">
              {token.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-[var(--bg-elevated)]/30 transition-colors">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="p-2.5">
                      {cell.tokens ? renderInlineTokens(cell.tokens) : cell.text}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'space':
      return null;

    default:
      return (
        <div key={index} className="my-1 text-[13px] text-[var(--text-primary)] select-text">
          {(token as any).text || (token as any).raw}
        </div>
      );
  }
}

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isStreaming = false,
  className = ''
}) => {
  if (!content || !content.trim()) {
    return isStreaming ? (
      <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle rounded-sm" />
    ) : null;
  }

  try {
    const tokens = marked.lexer(content);
    return (
      <div className={`font-sans text-[13px] leading-relaxed text-[var(--text-primary)] select-text ${className}`}>
        {tokens.map((token, idx) => renderBlockToken(token, idx))}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle rounded-sm" />
        )}
      </div>
    );
  } catch {
    // Graceful fallback to formatted text if parser encounters an edge case
    return (
      <div className={`font-sans text-[13px] leading-relaxed whitespace-pre-wrap text-[var(--text-primary)] select-text ${className}`}>
        {content}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle rounded-sm" />
        )}
      </div>
    );
  }
};
