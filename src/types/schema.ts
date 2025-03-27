import type { JSONSchemaType } from "@/components/SchemaEditor/SchemaExample";

export interface Field {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  parent: string | null;
  children: string[];
}

export interface NewField {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
}

export interface SchemaEditorState {
  fields: Record<string, Field>;
  rootFields: string[];
  schema: JSONSchemaType;
  handleAddField: (newField: NewField, parentId?: string) => void;
  handleEditField: (id: string, updatedField: NewField) => void;
  handleDeleteField: (id: string) => void;
  handleSchemaEdit: (schema: JSONSchemaType) => void;
}
