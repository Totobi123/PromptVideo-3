import { PromptInput } from '../PromptInput';
import { useState } from 'react';

export default function PromptInputExample() {
  const [value, setValue] = useState('');
  
  return (
    <div className="p-6 bg-background">
      <PromptInput value={value} onChange={setValue} />
    </div>
  );
}
