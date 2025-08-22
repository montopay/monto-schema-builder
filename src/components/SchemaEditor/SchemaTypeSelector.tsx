import type { FC } from "react";
import { cn } from "../../lib/utils.ts";
import type { SchemaType } from "../../types/jsonSchema.ts";

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

const typeOptions: TypeOption[] = [
  {
    id: "string",
    label: "Text",
    description: "For text values like names, descriptions, etc.",
  },
  {
    id: "number",
    label: "Number",
    description: "For decimal or whole numbers",
  },
  {
    id: "boolean",
    label: "Yes/No",
    description: "For true/false values",
  },
  {
    id: "object",
    label: "Group",
    description: "For grouping related fields together",
  },
  {
    id: "array",
    label: "List",
    description: "For collections of items",
  },
];

const SchemaTypeSelector: FC<SchemaTypeSelectorProps> = ({
  id,
  value,
  onChange,
}) => {
  return (
    <div
      id={id}
      className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2"
    >
      {typeOptions.map((type) => (
        <button
          type="button"
          key={type.id}
          title={type.description}
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
