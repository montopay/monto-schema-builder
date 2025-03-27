import type {
  Field,
  JSONSchema,
  JSONSchemaType,
  NewField,
  SchemaType,
} from "@/types/jsonSchema";
import { jsonSchema } from "@/types/jsonSchema";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface FieldState {
  fields: Record<string, Field>;
  rootFields: string[];
}

// Schema to Fields conversion
function processSchemaObject(
  props: Record<string, JSONSchemaType>,
  parentId: string | null,
  required: string[],
  result: Record<string, Field>,
  rootFieldIds: string[],
) {
  for (const [name, config] of Object.entries(props)) {
    if (typeof config === "boolean") continue;

    const id = parentId ? `${parentId}_${name}` : name;
    const isRequired = required.includes(name);
    const type = (config.type || "object") as SchemaType;

    const validation: Field["validation"] = {};

    // Extract validation rules based on type
    if (type === "string") {
      if (config.minLength !== undefined)
        validation.minLength = config.minLength;
      if (config.maxLength !== undefined)
        validation.maxLength = config.maxLength;
      if (config.pattern !== undefined) validation.pattern = config.pattern;
      if (config.format !== undefined) validation.format = config.format;
    } else if (type === "number") {
      if (config.minimum !== undefined) validation.minimum = config.minimum;
      if (config.maximum !== undefined) validation.maximum = config.maximum;
      if (config.exclusiveMinimum !== undefined)
        validation.exclusiveMinimum = config.exclusiveMinimum;
      if (config.exclusiveMaximum !== undefined)
        validation.exclusiveMaximum = config.exclusiveMaximum;
      if (config.multipleOf !== undefined)
        validation.multipleOf = config.multipleOf;
    } else if (type === "array") {
      if (config.minItems !== undefined) validation.minItems = config.minItems;
      if (config.maxItems !== undefined) validation.maxItems = config.maxItems;
      if (config.uniqueItems !== undefined)
        validation.uniqueItems = config.uniqueItems;
    } else if (type === "object") {
      if (config.minProperties !== undefined)
        validation.minProperties = config.minProperties;
      if (config.maxProperties !== undefined)
        validation.maxProperties = config.maxProperties;
      if (config.additionalProperties !== undefined) {
        validation.additionalProperties =
          typeof config.additionalProperties === "boolean"
            ? config.additionalProperties
            : true;
      }
    }

    result[id] = {
      id,
      name,
      type,
      description: config.description || "",
      required: isRequired,
      parent: parentId,
      children: [],
      validation,
    };

    if (!parentId) {
      rootFieldIds.push(id);
    } else if (result[parentId]) {
      result[parentId].children.push(id);
    }

    if (type === "object" && config.properties) {
      processSchemaObject(
        config.properties,
        id,
        config.required || [],
        result,
        rootFieldIds,
      );
    } else if (
      type === "array" &&
      config.items &&
      typeof config.items === "object" &&
      !Array.isArray(config.items) &&
      config.items.type === "object" &&
      config.items.properties
    ) {
      processSchemaObject(
        config.items.properties,
        id,
        config.items.required || [],
        result,
        rootFieldIds,
      );
    }
  }
}

function convertSchemaToFields(schema: JSONSchemaType): FieldState {
  if (
    typeof schema === "boolean" ||
    schema.type !== "object" ||
    !schema.properties
  ) {
    return { fields: {}, rootFields: [] };
  }

  const result: Record<string, Field> = {};
  const rootFieldIds: string[] = [];
  const required = schema.required || [];

  processSchemaObject(schema.properties, null, required, result, rootFieldIds);
  return { fields: result, rootFields: rootFieldIds };
}

// Fields to Schema conversion
function createFieldSchema(field: Field): JSONSchemaType {
  const baseSchema: JSONSchema = {
    type: field.type,
    description: field.description || undefined,
  };

  // Add validation rules based on type
  if (field.validation) {
    if (field.type === "string") {
      if (field.validation.minLength !== undefined)
        baseSchema.minLength = field.validation.minLength;
      if (field.validation.maxLength !== undefined)
        baseSchema.maxLength = field.validation.maxLength;
      if (field.validation.pattern !== undefined)
        baseSchema.pattern = field.validation.pattern;
      if (field.validation.format !== undefined)
        baseSchema.format = field.validation.format;
    } else if (field.type === "number" || field.type === "integer") {
      if (field.validation.minimum !== undefined)
        baseSchema.minimum = field.validation.minimum;
      if (field.validation.maximum !== undefined)
        baseSchema.maximum = field.validation.maximum;
      if (field.validation.exclusiveMinimum !== undefined)
        baseSchema.exclusiveMinimum = field.validation.exclusiveMinimum;
      if (field.validation.exclusiveMaximum !== undefined)
        baseSchema.exclusiveMaximum = field.validation.exclusiveMaximum;
      if (field.validation.multipleOf !== undefined)
        baseSchema.multipleOf = field.validation.multipleOf;
    } else if (field.type === "array") {
      if (field.validation.minItems !== undefined)
        baseSchema.minItems = field.validation.minItems;
      if (field.validation.maxItems !== undefined)
        baseSchema.maxItems = field.validation.maxItems;
      if (field.validation.uniqueItems !== undefined)
        baseSchema.uniqueItems = field.validation.uniqueItems;
    } else if (field.type === "object") {
      if (field.validation.minProperties !== undefined)
        baseSchema.minProperties = field.validation.minProperties;
      if (field.validation.maxProperties !== undefined)
        baseSchema.maxProperties = field.validation.maxProperties;
      if (field.validation.additionalProperties !== undefined)
        baseSchema.additionalProperties = field.validation.additionalProperties;
    }
  }

  if (field.type === "array") {
    return {
      ...baseSchema,
      items: { type: "object", properties: {} },
    };
  }
  if (field.type === "object") {
    return {
      ...baseSchema,
      properties: {},
    };
  }

  return baseSchema;
}

function convertFieldsToSchema(fieldState: FieldState): JSONSchemaType {
  const result: JSONSchema = {
    type: "object",
    properties: {},
    required: [],
  };

  for (const field of Object.values(fieldState.fields)) {
    if (!field.parent && result.properties) {
      result.properties[field.name] = createFieldSchema(field);
      if (field.required) {
        result.required?.push(field.name);
      }
    }
  }

  return result;
}

export function useSchemaEditor(initialSchema?: JSONSchemaType) {
  const [fieldState, setFieldState] = useState<FieldState>(() =>
    initialSchema
      ? convertSchemaToFields(initialSchema)
      : { fields: {}, rootFields: [] },
  );

  const schema = useMemo(() => convertFieldsToSchema(fieldState), [fieldState]);

  const handleAddField = useCallback(
    (newField: NewField, parentId?: string) => {
      try {
        setFieldState((prev) => {
          const fields = { ...prev.fields };
          const id = parentId ? `${parentId}_${newField.name}` : newField.name;

          // Check if field with same name already exists at this level
          const siblings = parentId
            ? fields[parentId]?.children.map((childId) => fields[childId])
            : prev.rootFields.map((rootId) => fields[rootId]);

          if (siblings?.some((sibling) => sibling.name === newField.name)) {
            throw new Error(
              `A field with name "${newField.name}" already exists at this level`,
            );
          }

          fields[id] = {
            id,
            name: newField.name,
            type: newField.type,
            description: newField.description,
            required: newField.required,
            parent: parentId || null,
            children: [],
            validation: newField.validation || {},
          };

          if (parentId) {
            fields[parentId].children.push(id);
            return { ...prev, fields };
          }
          return {
            fields,
            rootFields: [...prev.rootFields, id],
          };
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add field",
        );
      }
    },
    [],
  );

  const handleEditField = useCallback((id: string, updatedField: NewField) => {
    try {
      setFieldState((prev) => {
        const fields = { ...prev.fields };
        const field = fields[id];

        if (!field) {
          throw new Error(`Field with id "${id}" not found`);
        }

        // Check if new name conflicts with siblings
        const siblings = field.parent
          ? fields[field.parent]?.children
              .map((childId) => fields[childId])
              .filter((sibling) => sibling.id !== id)
          : prev.rootFields
              .map((rootId) => fields[rootId])
              .filter((sibling) => sibling.id !== id);

        if (siblings?.some((sibling) => sibling.name === updatedField.name)) {
          throw new Error(
            `A field with name "${updatedField.name}" already exists at this level`,
          );
        }

        fields[id] = {
          ...field,
          name: updatedField.name,
          type: updatedField.type,
          description: updatedField.description,
          required: updatedField.required,
          validation: updatedField.validation || {},
        };

        return { ...prev, fields };
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to edit field",
      );
    }
  }, []);

  const handleDeleteField = useCallback((id: string) => {
    setFieldState((prev) => {
      const fields = { ...prev.fields };
      const field = fields[id];

      if (!field) return prev;

      // Recursively delete all children
      const deleteChildren = (fieldId: string) => {
        const field = fields[fieldId];
        if (!field) return;

        field.children.forEach(deleteChildren);
        delete fields[fieldId];
      };

      deleteChildren(id);

      // Remove from parent's children array
      if (field.parent && fields[field.parent]) {
        fields[field.parent].children = fields[field.parent].children.filter(
          (childId) => childId !== id,
        );
      }

      // Remove from rootFields if it's a root field
      const rootFields = prev.rootFields.filter((rootId) => rootId !== id);

      return { fields, rootFields };
    });
  }, []);

  const handleSchemaEdit = useCallback((newSchema: JSONSchemaType) => {
    try {
      // Validate schema with Zod
      jsonSchema.parse(newSchema);
      setFieldState(convertSchemaToFields(newSchema));
    } catch (error) {
      toast.error("Invalid JSON Schema");
    }
  }, []);

  return {
    fields: fieldState.fields,
    rootFields: fieldState.rootFields,
    schema,
    handleAddField,
    handleEditField,
    handleDeleteField,
    handleSchemaEdit,
  };
}
