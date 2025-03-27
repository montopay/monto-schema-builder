import type { Field } from "@/hooks/useSchemaConverter";
import type React from "react";
import AddFieldButton from "./AddFieldButton";
import SchemaFieldList from "./SchemaFieldList";

interface SchemaVisualEditorProps {
  fields: Record<string, Field>;
  rootFields: string[];
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
}

const SchemaVisualEditor: React.FC<SchemaVisualEditorProps> = ({
  fields,
  rootFields,
  onAddField,
  onEditField,
  onDeleteField,
}) => {
  return (
    <div className="p-4 focus:outline-none">
      <div className="mb-6">
        <AddFieldButton onAddField={(field) => onAddField(field)} />
      </div>

      {rootFields.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="mb-3">No fields defined yet</p>
          <p className="text-sm">Add your first field to get started</p>
        </div>
      ) : (
        <SchemaFieldList
          fieldIds={rootFields}
          fields={fields}
          onAddField={onAddField}
          onEditField={onEditField}
          onDeleteField={onDeleteField}
        />
      )}
    </div>
  );
};

export default SchemaVisualEditor;
