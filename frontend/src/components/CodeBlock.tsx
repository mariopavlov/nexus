import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  language: string;
  value: string;
}

export default function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Map common language names to syntax highlighter's language identifiers
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'jsx',
    'tsx': 'tsx',
    'py': 'python',
    'cpp': 'cpp',
    'cs': 'csharp',
    'sh': 'bash',
    'shell': 'bash',
    'yml': 'yaml'
  };

  const highlightLanguage = languageMap[language.toLowerCase()] || language || 'text';

  return (
    <div className="relative rounded-lg overflow-hidden my-4 bg-[#282a36]">
      <div className="flex justify-between items-center px-4 py-2 bg-[#282a36] border-b border-[#44475a]">
        <span className="text-[#f8f8f2] text-sm font-mono">
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md bg-[#44475a] hover:bg-[#6272a4] text-[#f8f8f2] transition-colors"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="p-0">
        <SyntaxHighlighter
          language={highlightLanguage}
          style={dracula}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem'
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
