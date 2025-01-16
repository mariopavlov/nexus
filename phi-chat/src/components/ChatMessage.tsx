import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types/chat';

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
          className="prose max-w-none text-inherit prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-code:bg-gray-100 prose-code:text-gray-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 prose-pre:text-gray-900"
        >
          {typeof message.content === 'string' ? message.content : String(message.content)}
        </ReactMarkdown>
      </div>
    </div>
  );
}
