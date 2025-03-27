import type {
  JSONSchema as JSONSchemaType,
  NewField,
} from "@/types/jsonSchema";
import type React from "react";
import SchemaField from "./SchemaField";

interface SchemaFieldListProps {
  fields: Array<{
    name: string;
    path: string[];
    schema: JSONSchemaType;
    required: boolean;
  }>;
  onAddField: (newField: NewField, parentPath?: string[]) => void;
  onEditField: (path: string[], updatedField: NewField) => void;
  onDeleteField: (path: string[]) => void;
  depth?: number;
}

const SchemaFieldList: React.FC<SchemaFieldListProps> = ({
  fields,
  onAddField,
  onEditField,
  onDeleteField,
  depth = 0,
}) => {
  return (
    <div className="space-y-2 animate-in">
      {fields.map((field) => (
        <SchemaField
          key={field.path.join(".")}
          name={field.name}
          schema={field.schema}
          required={field.required}
          onDelete={() => onDeleteField(field.path)}
          onEdit={(updatedField) => onEditField(field.path, updatedField)}
          onAddField={(newField) => onAddField(newField, field.path)}
          isNested={depth > 0}
          depth={depth}
        />
      ))}
    </div>
  );
};

export default SchemaFieldList;
