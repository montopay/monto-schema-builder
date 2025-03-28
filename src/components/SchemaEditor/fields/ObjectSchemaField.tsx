import {
  getSchemaProperties,
  removeObjectProperty,
  updateObjectProperty,
  updatePropertyRequired,
} from "@/lib/schemaEditor";
import { cn } from "@/lib/utils";
import type { JSONSchema, NewField, SchemaType } from "@/types/jsonSchema";
import { useState } from "react";
import AddFieldButton from "../AddFieldButton";
import { ExpandButton, FieldActions, FieldDisplay } from "../SchemaField";

// Solve circular dependency using lazy loading
import { Suspense, lazy } from "react";
const SchemaField = lazy(() => import("../SchemaField"));

interface ObjectSchemaFieldProps {
  name: string;
  schema: JSONSchema;
  required?: boolean;
  onDelete: () => void;
  onEdit: (updatedField: NewField) => void;
  onAddField?: (newField: NewField) => void;
  isNested?: boolean;
  depth?: number;
}

const ObjectSchemaField: React.FC<ObjectSchemaFieldProps> = ({
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
  const type =
    typeof schema === "boolean"
      ? "object"
      : ((schema.type || "object") as SchemaType);
  const description =
    typeof schema === "boolean" ? "" : schema.description || "";

  // Get the object's properties
  const properties = getSchemaProperties(schema);
  const showChildren = expanded && properties.length > 0;

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

  // Extract object properties and required fields safely
  const getObjectValidation = (schema: JSONSchema) => {
    if (typeof schema === "boolean") return {};

    const validation: Record<string, unknown> = {};

    if (schema.properties) {
      validation.properties = schema.properties;
    }

    if (schema.required && schema.required.length > 0) {
      validation.required = schema.required;
    }

    return validation;
  };

  // Handle property updates within this object
  const handleChildEdit = (childName: string, updatedField: NewField) => {
    if (!onAddField) return; // Need onAddField to make schema changes

    const newChildSchema = {
      type: updatedField.type,
      description: updatedField.description,
      ...(updatedField.validation || {}),
    };

    // Create a new object schema with the updated property
    let newObjectSchema =
      typeof schema === "boolean"
        ? { type: "object" as const, properties: {} }
        : { ...schema };

    // Update or add the property
    newObjectSchema = updateObjectProperty(
      newObjectSchema,
      updatedField.name,
      newChildSchema,
    );

    // Update required status
    newObjectSchema = updatePropertyRequired(
      newObjectSchema,
      updatedField.name,
      updatedField.required || false,
    );

    // If name changed, remove the old property
    if (childName !== updatedField.name) {
      newObjectSchema = removeObjectProperty(newObjectSchema, childName);
    }

    // Update the parent with the new object schema
    onEdit({
      name: fieldName,
      type: "object",
      description,
      required,
      validation: getObjectValidation(newObjectSchema),
    });
  };

  // Handle property deletion within this object
  const handleChildDelete = (childName: string) => {
    if (!onAddField) return;

    // Remove the property from the object schema
    const newObjectSchema = removeObjectProperty(
      typeof schema === "boolean"
        ? { type: "object" as const, properties: {} }
        : { ...schema },
      childName,
    );

    // Update the parent with the new object schema
    onEdit({
      name: fieldName,
      type: "object",
      description,
      required,
      validation: getObjectValidation(newObjectSchema),
    });
  };

  // Add a field to this object
  const handleAddChildField = (childField: NewField) => {
    if (!onAddField) return;

    // Add the field to the object schema
    const childSchema = {
      type: childField.type,
      description: childField.description,
      ...(childField.validation || {}),
    };

    let newObjectSchema =
      typeof schema === "boolean"
        ? { type: "object" as const, properties: {} }
        : { ...schema };

    // Add the property
    newObjectSchema = updateObjectProperty(
      newObjectSchema,
      childField.name,
      childSchema,
    );

    // Update required status if needed
    if (childField.required) {
      newObjectSchema = updatePropertyRequired(
        newObjectSchema,
        childField.name,
        true,
      );
    }

    // Update the parent with the new object schema
    onEdit({
      name: fieldName,
      type: "object",
      description,
      required,
      validation: getObjectValidation(newObjectSchema),
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

      {showChildren && (
        <div className="pt-1 pb-2 px-2 sm:px-3 animate-in">
          <Suspense fallback={<div>Loading...</div>}>
            {properties.map((prop) => (
              <SchemaField
                key={prop.name}
                name={prop.name}
                schema={prop.schema}
                required={prop.required}
                onDelete={() => handleChildDelete(prop.name)}
                onEdit={(updatedField) =>
                  handleChildEdit(prop.name, updatedField)
                }
                depth={depth + 1}
                isNested={true}
              />
            ))}
          </Suspense>
          <div className="mt-3 ml-0 sm:ml-4">
            <AddFieldButton
              onAddField={handleAddChildField}
              variant="secondary"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectSchemaField;
