import type React from "react";

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

export type SchemaType = "string" | "number" | "boolean" | "object" | "array";

export interface BaseJSONSchema {
  type: SchemaType;
  description?: string;
  required?: string[];
}

export interface StringSchema extends BaseJSONSchema {
  type: "string";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface NumberSchema extends BaseJSONSchema {
  type: "number";
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
}

export interface BooleanSchema extends BaseJSONSchema {
  type: "boolean";
}

export interface ArraySchema extends BaseJSONSchema {
  type: "array";
  items: JSONSchemaType;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

export interface ObjectSchema extends BaseJSONSchema {
  type: "object";
  properties?: Record<string, JSONSchemaType>;
  required?: string[];
  additionalProperties?: boolean;
  minProperties?: number;
  maxProperties?: number;
}

export type JSONSchemaType =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | ArraySchema
  | ObjectSchema;

export const exampleSchema: ObjectSchema = {
  type: "object",
  properties: {
    person: {
      type: "object",
      description: "Personal information",
      properties: {
        firstName: {
          type: "string",
          description: "First name of the person",
        },
        lastName: {
          type: "string",
          description: "Last name of the person",
        },
        age: {
          type: "number",
          description: "Age in years",
        },
        isEmployed: {
          type: "boolean",
          description: "Whether the person is currently employed",
        },
      },
      required: ["firstName", "lastName"],
    },
    address: {
      type: "object",
      description: "Address information",
      properties: {
        street: {
          type: "string",
          description: "Street address",
        },
        city: {
          type: "string",
          description: "City name",
        },
        zipCode: {
          type: "string",
          description: "Postal/ZIP code",
        },
      },
    },
    hobbies: {
      type: "array",
      description: "List of hobbies",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the hobby",
          },
          yearsExperience: {
            type: "number",
            description: "Years of experience",
          },
        },
      },
    },
  },
  required: ["person"],
};

const SchemaExample: React.FC = () => {
  return null; // This component just exports the example schema
};

export default SchemaExample;
