import type {
  ArraySchema,
  BooleanSchema,
  JSONSchemaType,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from "@/components/SchemaEditor/SchemaExample";
import type { Field, NewField } from "@/types/schema";
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
    const id = parentId ? `${parentId}_${name}` : name;
    const isRequired = required.includes(name);
    const type = config.type;

    result[id] = {
      id,
      name,
      type,
      description: config.description || "",
      required: isRequired,
      parent: parentId,
      children: [],
    };

    if (!parentId) {
      rootFieldIds.push(id);
    } else if (result[parentId]) {
      result[parentId].children.push(id);
    }

    if (
      config.type === "object" &&
      "properties" in config &&
      config.properties
    ) {
      processSchemaObject(
        config.properties,
        id,
        required,
        result,
        rootFieldIds,
      );
    } else if (
      config.type === "array" &&
      "items" in config &&
      config.items &&
      typeof config.items === "object" &&
      config.items.type === "object" &&
      "properties" in config.items &&
      config.items.properties
    ) {
      processSchemaObject(
        config.items.properties,
        id,
        required,
        result,
        rootFieldIds,
      );
    }
  }
}

function convertSchemaToFields(schema: JSONSchemaType): FieldState {
  if (schema.type !== "object" || !schema.properties) {
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
  const baseSchema = {
    type: field.type,
    description: field.description || undefined,
  };

  switch (field.type) {
    case "array":
      return {
        ...baseSchema,
        items: { type: "object", properties: {} },
      } as ArraySchema;
    case "object":
      return {
        ...baseSchema,
        properties: {},
      } as ObjectSchema;
    default:
      return baseSchema as StringSchema | NumberSchema | BooleanSchema;
  }
}

function convertFieldsToSchema(fieldState: FieldState): JSONSchemaType {
  const result: ObjectSchema = {
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

// Field operations
function addField(
  prev: FieldState,
  newField: NewField,
  parentId?: string,
): FieldState | null {
  const id = `${parentId ? `${parentId}_` : ""}${newField.name}`;

  // Validation
  if (parentId && !prev.fields[parentId]) {
    toast.error(`Parent field "${parentId}" does not exist`);
    return null;
  }

  const siblings = parentId ? prev.fields[parentId].children : prev.rootFields;
  const isDuplicate = siblings.some(
    (fieldId) => prev.fields[fieldId].name === newField.name,
  );

  if (isDuplicate) {
    toast.error(
      `A field named "${newField.name}" already exists at this level`,
    );
    return null;
  }

  // Create new field
  const field: Field = {
    id,
    ...newField,
    parent: parentId || null,
    children: [],
  };

  // Update state
  const newFields = {
    ...prev.fields,
    [id]: field,
  };

  if (parentId) {
    newFields[parentId] = {
      ...newFields[parentId],
      children: [...newFields[parentId].children, id],
    };
  }

  const newRootFields = parentId ? prev.rootFields : [...prev.rootFields, id];
  toast.success(`Added field "${newField.name}"`);

  return { fields: newFields, rootFields: newRootFields };
}

function editField(
  prev: FieldState,
  id: string,
  updatedField: NewField,
): FieldState | null {
  const field = prev.fields[id];
  if (!field) {
    toast.error(`Field "${id}" does not exist`);
    return null;
  }

  const parentId = field.parent;
  const siblings = parentId
    ? prev.fields[parentId].children.filter((childId) => childId !== id)
    : prev.rootFields.filter((rootId) => rootId !== id);

  if (field.name !== updatedField.name) {
    const isDuplicate = siblings.some(
      (siblingId) => prev.fields[siblingId].name === updatedField.name,
    );

    if (isDuplicate) {
      toast.error(
        `A field named "${updatedField.name}" already exists at this level`,
      );
      return null;
    }
  }

  const newFields = {
    ...prev.fields,
    [id]: {
      ...field,
      ...updatedField,
    },
  };

  toast.success(`Updated field "${updatedField.name}"`);
  return { ...prev, fields: newFields };
}

function getAllChildrenIds(
  fields: Record<string, Field>,
  fieldId: string,
): string[] {
  const childIds = fields[fieldId].children;
  const allDescendants = [...childIds];

  for (const childId of childIds) {
    allDescendants.push(...getAllChildrenIds(fields, childId));
  }

  return allDescendants;
}

function deleteField(prev: FieldState, id: string): FieldState | null {
  const field = prev.fields[id];
  if (!field) {
    toast.error(`Field "${id}" does not exist`);
    return null;
  }

  const parentId = field.parent;
  const newFields = { ...prev.fields };

  if (parentId) {
    newFields[parentId] = {
      ...newFields[parentId],
      children: newFields[parentId].children.filter(
        (childId) => childId !== id,
      ),
    };
  }

  const childrenIds = getAllChildrenIds(prev.fields, id);
  for (const childId of childrenIds) {
    delete newFields[childId];
  }
  delete newFields[id];

  const newRootFields = parentId
    ? prev.rootFields
    : prev.rootFields.filter((fieldId) => fieldId !== id);

  toast.success(`Deleted field "${field.name}"`);
  return { fields: newFields, rootFields: newRootFields };
}

// Main hook
export function useSchemaEditor(initialSchema: JSONSchemaType) {
  const [fieldState, setFieldState] = useState<FieldState>(() =>
    convertSchemaToFields(initialSchema),
  );

  const handleAddField = useCallback(
    (newField: NewField, parentId?: string) => {
      setFieldState((prev) => addField(prev, newField, parentId) || prev);
    },
    [],
  );

  const handleEditField = useCallback((id: string, updatedField: NewField) => {
    setFieldState((prev) => editField(prev, id, updatedField) || prev);
  }, []);

  const handleDeleteField = useCallback((id: string) => {
    setFieldState((prev) => deleteField(prev, id) || prev);
  }, []);

  const handleSchemaEdit = useCallback((newSchema: JSONSchemaType) => {
    setFieldState(convertSchemaToFields(newSchema));
  }, []);

  const schema = useMemo(() => convertFieldsToSchema(fieldState), [fieldState]);

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
