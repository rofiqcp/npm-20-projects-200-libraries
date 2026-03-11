import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
      title="Copy code"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    if (!inline && match) {
      return (
        <div className="relative group my-3">
          <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-t px-3 py-1.5">
            <span className="text-xs text-gray-500 font-mono">{match[1]}</span>
            <CopyButton text={codeString} />
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: '0 0 6px 6px',
              border: '1px solid #374151',
              borderTop: 'none',
              fontSize: '0.8125rem',
              background: '#0d0d1a',
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code
        className="bg-indigo-900/30 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  p({ children }) {
    return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
  },
  ul({ children }) {
    return <ul className="list-disc list-inside mb-3 space-y-1 pl-2">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal list-inside mb-3 space-y-1 pl-2">{children}</ol>;
  },
  li({ children }) {
    return <li className="text-gray-300">{children}</li>;
  },
  h1({ children }) {
    return <h1 className="text-xl font-bold text-white mb-3 mt-4 first:mt-0">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-lg font-semibold text-white mb-2 mt-4 first:mt-0">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-base font-semibold text-gray-200 mb-2 mt-3 first:mt-0">{children}</h3>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-400 my-3">
        {children}
      </blockquote>
    );
  },
  strong({ children }) {
    return <strong className="font-semibold text-white">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic text-gray-300">{children}</em>;
  },
  hr() {
    return <hr className="border-gray-700 my-4" />;
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 hover:text-indigo-300 underline"
      >
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border border-gray-700 bg-gray-800 px-3 py-1.5 text-left text-gray-200 font-semibold">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="border border-gray-700 px-3 py-1.5 text-gray-300">{children}</td>
    );
  },
};

export default function Message({ message, isStreaming, streamingContent }) {
  const isUser = message?.role === 'user';
  const isAssistant = message?.role === 'assistant';

  const content = isStreaming ? streamingContent : message?.content || '';
  const showTypingCursor = isStreaming;

  return (
    <div className={`flex gap-3 message-enter ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-1">
          <Bot size={15} className="text-indigo-400" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-md'
            : 'bg-gray-800/80 text-gray-100 border border-gray-700/60 rounded-bl-md'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        ) : (
          <div className="text-sm leading-relaxed">
            {content ? (
              <>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {content}
                </ReactMarkdown>
                {showTypingCursor && <span className="typing-cursor" />}
              </>
            ) : (
              <div className="flex gap-1.5 items-center py-1">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {!isStreaming && message?.createdAt && (
          <div
            className={`text-xs mt-1.5 ${
              isUser ? 'text-indigo-200/60 text-right' : 'text-gray-600'
            }`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {message.tokens ? ` · ${message.tokens} tokens` : ''}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center shrink-0 mt-1">
          <User size={15} className="text-gray-300" />
        </div>
      )}
    </div>
  );
}
