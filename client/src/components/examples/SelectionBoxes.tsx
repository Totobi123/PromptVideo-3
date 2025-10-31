import { SelectionBoxes } from '../SelectionBoxes';
import { useState } from 'react';

export default function SelectionBoxesExample() {
  const [mood, setMood] = useState('happy');
  const [pace, setPace] = useState('normal');
  const [length, setLength] = useState('60');
  
  return (
    <div className="p-6 bg-background space-y-8">
      <SelectionBoxes type="mood" selected={mood} onSelect={setMood} />
      <SelectionBoxes type="pace" selected={pace} onSelect={setPace} />
      <SelectionBoxes type="length" selected={length} onSelect={setLength} />
    </div>
  );
}
