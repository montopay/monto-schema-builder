
import React from 'react';
import { cn } from '@/lib/utils';

interface SchemaTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const SchemaTypeSelector: React.FC<SchemaTypeSelectorProps> = ({ value, onChange }) => {
  const types = [
    { id: 'string', label: 'Text', description: 'Letters, words, sentences' },
    { id: 'number', label: 'Number', description: 'Integer or decimal values' },
    { id: 'boolean', label: 'Yes/No', description: 'True or false values' },
    { id: 'object', label: 'Group', description: 'Contains multiple fields' },
    { id: 'array', label: 'List', description: 'Collection of items' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
      {types.map((type) => (
        <button
          key={type.id}
          className={cn(
            "p-3 rounded-lg border-2 text-left transition-all duration-200",
            value === type.id 
              ? "border-primary bg-primary/5 shadow-sm" 
              : "border-border hover:border-primary/30 hover:bg-secondary"
          )}
          onClick={() => onChange(type.id)}
        >
          <div className="font-medium mb-1">{type.label}</div>
          <div className="text-xs text-muted-foreground">{type.description}</div>
        </button>
      ))}
    </div>
  );
};

export default SchemaTypeSelector;
