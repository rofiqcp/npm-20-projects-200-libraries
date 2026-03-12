import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function Preview({ content }) {
  if (!content) {
    return (
      <div className="p-6 text-gray-400 text-sm italic">
        Nothing to preview yet.
      </div>
    );
  }

  return (
    <div className="p-6 prose prose-sm max-w-none overflow-auto h-full text-gray-800">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
