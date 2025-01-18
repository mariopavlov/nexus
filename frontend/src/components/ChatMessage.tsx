import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types/chat';
import CodeBlock from './CodeBlock';

export default function ChatMessage({ message }: { message: Message }) {
  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } mb-6`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 shadow-sm space-y-4 ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              // For inline code, return the original text
              if (inline) {
                return <span className="bg-black text-white font-bold italic px-1 py-0.5 rounded">{"{"}{children}{"}"}</span>;
              }

              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              const codeContent = String(children).replace(/\n$/, '');

              // Only use CodeBlock for multiline code
              if (codeContent.includes('\n')) {
                return (
                  <CodeBlock
                    language={language}
                    value={codeContent}
                  />
                );
              }

              // For single line code, return the original text
              return <>{children}</>;
            },
            // Ensure pre elements are rendered properly
            pre: ({ children }) => children
          }}
          className="prose max-w-none text-inherit prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit"
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
