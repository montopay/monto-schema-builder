import type React from "react";

export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// Define a generic JSON Schema type that can handle any structure
export type JSONSchemaType = {
  type: string;
  properties?: Record<string, JSONSchemaType>;
  items?: JSONSchemaType | Record<string, JSONSchemaType>;
  required?: string[];
  description?: string;
  [key: string]: JSONValue | undefined;
};

export const exampleSchema: JSONSchemaType = {
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
