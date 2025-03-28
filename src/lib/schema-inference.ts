import type { JSONSchema } from "@/types/jsonSchema";

/**
 * Infers a JSON Schema from a JSON object
 * Based on json-schema-generator approach
 */
export function inferSchema(obj: unknown): JSONSchema {
  if (obj === null) return { type: "null" };
  
  const type = Array.isArray(obj) ? "array" : typeof obj;
  
  switch (type) {
    case "object": {
      const properties: Record<string, JSONSchema> = {};
      const required: string[] = [];
      
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        properties[key] = inferSchema(value);
        if (value !== undefined && value !== null) {
          required.push(key);
        }
      }
      
      return { 
        type: "object", 
        properties, 
        required: required.length > 0 ? required : undefined 
      };
    }
      
    case "array": {
      if ((obj as unknown[]).length === 0) return { type: "array", items: {} };
      
      // Get schemas for all items to better handle mixed arrays
      const itemSchemas = (obj as unknown[]).map(item => inferSchema(item));
      
      // Check if all types are the same
      const allSameType = itemSchemas.every(schema => 
        schema.type === itemSchemas[0].type
      );
      
      if (allSameType && itemSchemas.length > 0) {
        // For consistent arrays, use the first item's schema
        return { 
          type: "array", 
          items: itemSchemas[0],
          minItems: 0
        };
      }
      
      // For mixed type arrays, create a oneOf schema
      if (itemSchemas.length > 0) {
        return {
          type: "array",
          items: {
            oneOf: [...new Map(itemSchemas.map(s => [JSON.stringify(s), s])).values()]
          },
          minItems: 0
        };
      }
      
      return { type: "array", items: {} };
    }
      
    case "string": {
      // Check for common formats
      const str = obj as string;
      const formats = {
        date: /^\d{4}-\d{2}-\d{2}$/,
        "date-time": /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
        email: /^[^@]+@[^@]+\.[^@]+$/,
        uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        uri: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
      };
      
      for (const [format, regex] of Object.entries(formats)) {
        if (regex.test(str)) {
          return { type: "string", format };
        }
      }
      
      return { type: "string" };
    }
      
    case "number":
      // Check if it's an integer
      if (Number.isInteger(obj as number)) {
        return { type: "integer" };
      }
      return { type: "number" };
      
    case "boolean":
      return { type: "boolean" };
      
    default:
      return {};
  }
}

/**
 * Creates a full JSON Schema document from a JSON object
 */
export function createSchemaFromJson(jsonObject: unknown): JSONSchema {
  const inferredSchema = inferSchema(jsonObject);
  
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    ...inferredSchema,
    title: "Generated Schema",
    description: "Generated from JSON data"
  };
}