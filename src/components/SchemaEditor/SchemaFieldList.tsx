import type {
  JSONSchema as JSONSchemaType,
  NewField,
} from "@/types/jsonSchema";
import type React from "react";
import SchemaField from "./SchemaField";
import { getSchemaProperties } from "@/lib/schemaEditor";

interface SchemaFieldListProps {
  schema: JSONSchemaType;
  onAddField: (newField: NewField) => void;
  onEditField: (name: string, updatedField: NewField) => void;
  onDeleteField: (name: string) => void;
}

const SchemaFieldList: React.FC<SchemaFieldListProps> = ({
  schema,
  onAddField,
  onEditField,
  onDeleteField,
}) => {
  // Get the properties from the schema
  const properties = getSchemaProperties(schema);

  return (
    <div className="space-y-2 animate-in">
      {properties.map((property) => (
        <SchemaField
          key={property.name}
          name={property.name}
          schema={property.schema}
          required={property.required}
          onDelete={() => onDeleteField(property.name)}
          onEdit={(updatedField) => onEditField(property.name, updatedField)}
          onAddField={onAddField}
        />
      ))}
    </div>
  );
};

export default SchemaFieldList;
