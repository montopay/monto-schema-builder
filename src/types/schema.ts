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
  type: Field["type"];
  description: string;
  required: boolean;
}

export interface FieldsState {
  fields: Record<string, Field>;
  rootFields: string[];
}

export interface SchemaConverterState extends FieldsState {
  schema: JSONSchemaType;
  setSchema: (schema: JSONSchemaType) => void;
  convertFieldsToSchema: () => JSONSchemaType;
}

export interface SchemaFieldsState extends FieldsState {
  setFields: (fields: Record<string, Field>) => void;
  setRootFields: (rootFields: string[]) => void;
  handleAddField: (newField: NewField, parentId?: string) => void;
  handleEditField: (id: string, updatedField: NewField) => void;
  handleDeleteField: (id: string) => void;
}
