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
        className={`max-w-[80%] rounded-lg p-4 shadow-sm ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              if (inline) {
                return <code className="bg-gray-100 text-gray-900 px-1 py-0.5 rounded" {...props}>{children}</code>;
              }
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              return (
                <CodeBlock
                  language={language}
                  value={String(children).replace(/\n$/, '')}
                />
              );
            }
          }}
          className="prose max-w-none text-inherit prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit"
        >
          {typeof message.content === 'string' ? message.content : String(message.content)}
        </ReactMarkdown>
      </div>
    </div>
  );
}
