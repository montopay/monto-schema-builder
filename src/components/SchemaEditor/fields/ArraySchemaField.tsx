import { useState } from "react";
import type { JSONSchema, NewField, SchemaType } from "@/types/jsonSchema";
import { getArrayItemsSchema, updateArrayItems } from "@/lib/schemaEditor";
import { cn } from "@/lib/utils";
import { ExpandButton, FieldActions, FieldDisplay } from "../SchemaField";
import AddFieldButton from "../AddFieldButton";

// Solve circular dependency using lazy loading
import { lazy, Suspense } from "react";
const SchemaField = lazy(() => import("../SchemaField"));

interface ArraySchemaFieldProps {
  name: string;
  schema: JSONSchema;
  required?: boolean;
  onDelete: () => void;
  onEdit: (updatedField: NewField) => void;
  onAddField?: (newField: NewField) => void;
  isNested?: boolean;
  depth?: number;
}

const ArraySchemaField: React.FC<ArraySchemaFieldProps> = ({
  name,
  schema,
  required = false,
  onDelete,
  onEdit,
  onAddField,
  isNested = false,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [fieldName, setFieldName] = useState(name);
  const type = typeof schema === "boolean" ? "array" : (schema.type || "array") as SchemaType;
  const description = typeof schema === "boolean" ? "" : schema.description || "";

  // Get the array's item schema
  const itemsSchema = getArrayItemsSchema(schema) || { type: "string" };
  const showItems = expanded;

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

  // Handle updates to the array's item schema
  const handleItemsEdit = (updatedField: NewField) => {
    if (!onAddField) return; // Need onAddField to make schema changes
    
    const newItemsSchema = {
      type: updatedField.type,
      description: updatedField.description,
      ...(updatedField.validation || {}),
    };
    
    // Update the array schema with the new items schema
    const newArraySchema = updateArrayItems(
      typeof schema === 'boolean' ? { type: 'array' as const } : { ...schema },
      newItemsSchema
    );
    
    const items = typeof newArraySchema === 'boolean' ? undefined : newArraySchema.items;
    
    // Update the parent with the new array schema
    onEdit({
      name: fieldName,
      type: 'array',
      description,
      required,
      validation: {
        ...(items && { items })
      }
    });
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
          <ExpandButton
            expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          />

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

      {showItems && (
        <div className="pt-1 pb-2 px-2 sm:px-3 animate-in">
          <div className="ml-0 sm:ml-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">Items:</div>
            <Suspense fallback={<div>Loading...</div>}>
              <SchemaField
                name="items"
                schema={itemsSchema}
                required={false}
                onDelete={() => { /* Items schema cannot be deleted */ }}
                onEdit={handleItemsEdit}
                depth={depth + 1}
                isNested={true}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArraySchemaField; 