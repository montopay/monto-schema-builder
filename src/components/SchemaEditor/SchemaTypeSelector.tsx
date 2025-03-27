import { cn } from "@/lib/utils";
import type React from "react";
import type { SchemaType } from "./SchemaExample";

interface SchemaTypeSelectorProps {
  id?: string;
  value: SchemaType;
  onChange: (value: SchemaType) => void;
}

interface TypeOption {
  id: SchemaType;
  label: string;
  description: string;
}

const types: TypeOption[] = [
  { id: "string", label: "Text", description: "Letters, words, sentences" },
  { id: "number", label: "Number", description: "Integer or decimal values" },
  { id: "boolean", label: "Yes/No", description: "True or false values" },
  { id: "object", label: "Group", description: "Contains multiple fields" },
  { id: "array", label: "List", description: "Collection of items" },
];

const SchemaTypeSelector: React.FC<SchemaTypeSelectorProps> = ({
  id,
  value,
  onChange,
}) => {
  return (
    <div
      id={id}
      className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2"
    >
      {types.map((type) => (
        <button
          type="button"
          key={type.id}
          className={cn(
            "p-2.5 rounded-lg border-2 text-left transition-all duration-200",
            value === type.id
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/30 hover:bg-secondary",
          )}
          onClick={() => onChange(type.id)}
        >
          <div className="font-medium text-sm">{type.label}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">
            {type.description}
          </div>
        </button>
      ))}
    </div>
  );
};

export default SchemaTypeSelector;
