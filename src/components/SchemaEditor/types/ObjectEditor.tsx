import { Button } from "@/components/ui/button";
import {
  getSchemaProperties,
  removeObjectProperty,
  updateObjectProperty,
  updatePropertyRequired,
} from "@/lib/schemaEditor";
import { cn } from "@/lib/utils";
import type {
  JSONSchema,
  NewField,
  ObjectJSONSchema,
} from "@/types/jsonSchema";
import { useEffect, useState } from "react";
import AddFieldButton from "../AddFieldButton";
import SchemaPropertyEditor from "../SchemaPropertyEditor";
import type { TypeEditorProps } from "../TypeEditor";

const ObjectEditor: React.FC<TypeEditorProps> = ({
  schema,
  onChange,
  depth = 0,
}) => {
  const [minProperties, setMinProperties] = useState<number | undefined>(
    typeof schema === "boolean" ? undefined : schema.minProperties,
  );
  const [maxProperties, setMaxProperties] = useState<number | undefined>(
    typeof schema === "boolean" ? undefined : schema.maxProperties,
  );

  // Get object properties
  const properties = getSchemaProperties(schema);

  // Create a normalized schema object
  const normalizedSchema: ObjectJSONSchema =
    typeof schema === "boolean"
      ? { type: "object", properties: {} }
      : { ...schema, type: "object", properties: schema.properties || {} };

  // Handle adding a new property
  const handleAddProperty = (newField: NewField) => {
    // Create field schema from the new field data
    const fieldSchema = {
      type: newField.type,
      description: newField.description || undefined,
      ...(newField.validation || {}),
    } as ObjectJSONSchema;

    // Add the property to the schema
    let newSchema = updateObjectProperty(
      normalizedSchema,
      newField.name,
      fieldSchema,
    );

    // Update required status if needed
    if (newField.required) {
      newSchema = updatePropertyRequired(newSchema, newField.name, true);
    }

    // Update the schema
    onChange(newSchema);
  };

  // Handle deleting a property
  const handleDeleteProperty = (propertyName: string) => {
    const newSchema = removeObjectProperty(normalizedSchema, propertyName);
    onChange(newSchema);
  };

  // Handle property name change
  const handlePropertyNameChange = (oldName: string, newName: string) => {
    if (oldName === newName) return;

    const property = properties.find((p) => p.name === oldName);
    if (!property) return;

    const propertySchemaObj =
      typeof property.schema === "boolean"
        ? { type: "object" as const }
        : property.schema;

    // Add property with new name
    let newSchema = updateObjectProperty(
      normalizedSchema,
      newName,
      propertySchemaObj,
    );

    // Update required status
    if (property.required) {
      newSchema = updatePropertyRequired(newSchema, newName, true);
    }

    // Remove old property
    newSchema = removeObjectProperty(newSchema, oldName);

    // Update schema
    onChange(newSchema);
  };

  // Handle property required status change
  const handlePropertyRequiredChange = (
    propertyName: string,
    required: boolean,
  ) => {
    const newSchema = updatePropertyRequired(
      normalizedSchema,
      propertyName,
      required,
    );
    onChange(newSchema);
  };

  // Handle property description change
  const handlePropertyDescriptionChange = (
    propertyName: string,
    description: string,
  ) => {
    const property = properties.find((p) => p.name === propertyName);
    if (!property) return;

    const propertySchema =
      typeof property.schema === "boolean"
        ? { type: "object" as const, description }
        : { ...property.schema, description: description || undefined };

    const newSchema = updateObjectProperty(
      normalizedSchema,
      propertyName,
      propertySchema,
    );
    onChange(newSchema);
  };

  // Handle property schema change
  const handlePropertySchemaChange = (
    propertyName: string,
    propertySchema: ObjectJSONSchema,
  ) => {
    const newSchema = updateObjectProperty(
      normalizedSchema,
      propertyName,
      propertySchema,
    );
    onChange(newSchema);
  };

  return (
    <div className="space-y-4">
      {properties.length > 0 ? (
        <div className="space-y-2">
          {properties.map((property) => (
            <SchemaPropertyEditor
              key={property.name}
              name={property.name}
              schema={property.schema}
              required={property.required}
              onDelete={() => handleDeleteProperty(property.name)}
              onNameChange={(newName) =>
                handlePropertyNameChange(property.name, newName)
              }
              onRequiredChange={(required) =>
                handlePropertyRequiredChange(property.name, required)
              }
              onDescriptionChange={(desc) =>
                handlePropertyDescriptionChange(property.name, desc)
              }
              onSchemaChange={(schema) =>
                handlePropertySchemaChange(property.name, schema)
              }
              depth={depth}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic p-2 text-center border rounded-md">
          No properties defined
        </div>
      )}

      <div className="mt-4">
        <AddFieldButton onAddField={handleAddProperty} variant="secondary" />
      </div>
    </div>
  );
};

export default ObjectEditor;
