import React from 'react';

export default function Editor({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="# Start writing in Markdown...

## Heading 2

Write **bold**, *italic*, or `code`.

- List item 1
- List item 2

```js
const hello = 'world';
```"
      className="w-full h-full resize-none border-0 outline-none text-sm text-gray-800 font-mono leading-relaxed p-4 bg-white"
      spellCheck={false}
    />
  );
}
