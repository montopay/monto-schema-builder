import type { JSONSchema, NewField, SchemaType } from "@/types/jsonSchema";
import type React from "react";
import AddFieldButton from "./AddFieldButton";
import SchemaFieldList from "./SchemaFieldList";

interface SchemaVisualEditorProps {
  fieldInfo: {
    type: SchemaType;
    properties: Array<{
      name: string;
      path: string[];
      schema: JSONSchema;
      required: boolean;
    }>;
  } | null;
  onAddField: (newField: NewField, parentPath?: string[]) => void;
  onEditField: (path: string[], updatedField: NewField) => void;
  onDeleteField: (path: string[]) => void;
}

const SchemaVisualEditor: React.FC<SchemaVisualEditorProps> = ({
  fieldInfo,
  onAddField,
  onEditField,
  onDeleteField,
}) => {
  return (
    <div className="p-4 focus:outline-none">
      <div className="mb-6">
        <AddFieldButton onAddField={(field) => onAddField(field)} />
      </div>

      {!fieldInfo?.properties.length ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="mb-3">No fields defined yet</p>
          <p className="text-sm">Add your first field to get started</p>
        </div>
      ) : (
        <SchemaFieldList
          fields={fieldInfo.properties}
          onAddField={onAddField}
          onEditField={onEditField}
          onDeleteField={onDeleteField}
        />
      )}
    </div>
  );
};

export default SchemaVisualEditor;
