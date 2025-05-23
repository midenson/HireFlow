'use client'
import React, { useState } from 'react';

function SelectComponent() {
  const [selectedValue, setSelectedValue] = useState('');
  
  const OPENROUTER_API = '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';

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  return (
    <div>
      <select value={selectedValue} onChange={handleChange}>
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
      <p>Selected value: {selectedValue}</p>
    </div>
  );
}

export default SelectComponent;