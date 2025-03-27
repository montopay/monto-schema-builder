import type { Field } from "@/types/schema";
import type React from "react";
import { toast } from "sonner";
import AddFieldButton from "./AddFieldButton";
import SchemaField from "./SchemaField";

interface SchemaFieldListProps {
  fieldIds: string[];
  fields: Record<string, Field>;
  onAddField: (
    newField: {
      name: string;
      type: string;
      description: string;
      required: boolean;
    },
    parentId?: string,
  ) => void;
  onEditField: (
    id: string,
    updatedField: {
      name: string;
      type: string;
      description: string;
      required: boolean;
    },
  ) => void;
  onDeleteField: (id: string) => void;
  depth?: number;
}

const SchemaFieldList: React.FC<SchemaFieldListProps> = ({
  fieldIds,
  fields,
  onAddField,
  onEditField,
  onDeleteField,
  depth = 0,
}) => {
  const renderFieldsRecursively = (ids: string[], currentDepth: number) => {
    return ids.map((id) => {
      const field = fields[id];
      return (
        <SchemaField
          key={id}
          name={field.name}
          type={field.type}
          description={field.description}
          required={field.required}
          onDelete={() => onDeleteField(id)}
          onEdit={(updatedField) => onEditField(id, updatedField)}
          isNested={currentDepth > 0}
          depth={currentDepth}
        >
          {field.children &&
            renderFieldsRecursively(field.children, currentDepth + 1)}

          {(field.type === "object" || field.type === "array") && (
            <div className="mt-3 ml-4">
              <AddFieldButton
                onAddField={(newField) => onAddField(newField, id)}
                variant="secondary"
              />
            </div>
          )}
        </SchemaField>
      );
    });
  };

  return (
    <div className="space-y-2 animate-in">
      {renderFieldsRecursively(fieldIds, depth)}
    </div>
  );
};

export default SchemaFieldList;
