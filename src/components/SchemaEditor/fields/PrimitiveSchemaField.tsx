import { cn } from "@/lib/utils";
import type { JSONSchema, NewField, SchemaType } from "@/types/jsonSchema";
import { useState } from "react";
import { FieldActions, FieldDisplay } from "../SchemaField";

interface PrimitiveSchemaFieldProps {
  name: string;
  schema: JSONSchema;
  required?: boolean;
  onDelete: () => void;
  onEdit: (updatedField: NewField) => void;
  onAddField?: (newField: NewField) => void;
  isNested?: boolean;
  depth?: number;
}

const PrimitiveSchemaField: React.FC<PrimitiveSchemaFieldProps> = ({
  name,
  schema,
  required = false,
  onDelete,
  onEdit,
  isNested = false,
  depth = 0,
}) => {
  const [fieldName, setFieldName] = useState(name);
  const type =
    typeof schema === "boolean"
      ? "string" // Default to string for boolean schemas
      : ((schema.type || "string") as SchemaType);
  const description =
    typeof schema === "boolean" ? "" : schema.description || "";

  const handleFieldChange = (changes: Partial<NewField>) => {
    const newField = {
      name: fieldName,
      type,
      description,
      required,
      ...changes,
    };
    setFieldName(newField.name);
    onEdit(newField);
  };

  return (
    <div
      className={cn(
        "mb-2 animate-in rounded-lg border transition-all duration-200",
        depth > 0 && "ml-0 sm:ml-4 border-l border-l-border/40",
        isNested && "mt-2",
      )}
    >
      <div className="relative json-field-row justify-between group">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <div className="w-[18px]" /> {/* Spacer to align with other fields */}
          <FieldDisplay
            name={fieldName}
            schema={schema}
            required={required || false}
            onTypeChange={(type) => handleFieldChange({ type })}
            onRequiredChange={(required) => handleFieldChange({ required })}
            onNameChange={(name) => handleFieldChange({ name })}
            onDescriptionChange={(description) =>
              handleFieldChange({ description })
            }
          />
        </div>

        <FieldActions onDelete={onDelete} />
      </div>
    </div>
  );
};

export default PrimitiveSchemaField;
