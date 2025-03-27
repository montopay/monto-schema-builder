import { useEffect, useState } from 'react';

export type Field = {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
  parent?: string | null;
  children?: string[];
};

export type SchemaToFieldsResult = {
  fields: Record<string, Field>;
  rootFields: string[];
};

/**
 * Hook to convert between JSON Schema and internal field representation
 */
export const useSchemaConverter = (initialSchema: any = {}) => {
  const [fields, setFields] = useState<Record<string, Field>>({});
  const [rootFields, setRootFields] = useState<string[]>([]);
  const [schema, setSchema] = useState(initialSchema);

  // Convert schema to our internal fields format
  const convertSchemaToFields = (schema: any): SchemaToFieldsResult => {
    if (!schema || !schema.properties) return { fields: {}, rootFields: [] };
    
    const fieldsMap: Record<string, Field> = {};
    const roots: string[] = [];
    const required = schema.required || [];
    
    const processObject = (props: any, parentId: string | null = null) => {
      Object.entries(props).forEach(([name, config]: [string, any]) => {
        const id = `${parentId ? `${parentId}_` : ''}${name}`;
        const isRequired = required.includes(name);
        
        fieldsMap[id] = {
          id,
          name,
          type: config.type || 'string',
          description: config.description || '',
          required: isRequired,
          parent: parentId,
          children: [],
        };
        
        if (parentId) {
          if (!fieldsMap[parentId].children) {
            fieldsMap[parentId].children = [];
          }
          fieldsMap[parentId].children!.push(id);
        } else {
          roots.push(id);
        }
        
        if (config.type === 'object' && config.properties) {
          processObject(config.properties, id);
        } else if (config.type === 'array' && config.items && config.items.type === 'object' && config.items.properties) {
          processObject(config.items.properties, id);
        }
      });
    };
    
    if (schema.properties) {
      processObject(schema.properties);
    }
    
    return { fields: fieldsMap, rootFields: roots };
  };
  
  // Convert our internal fields format back to JSON Schema
  const convertFieldsToSchema = () => {
    const schema: any = {
      type: 'object',
      properties: {},
      required: [],
    };
    
    const processFields = (fieldIds: string[], targetObj: any) => {
      fieldIds.forEach(id => {
        const field = fields[id];
        
        if (field.type === 'object') {
          targetObj[field.name] = {
            type: 'object',
            properties: {},
          };
          
          if (field.description) {
            targetObj[field.name].description = field.description;
          }
          
          if (field.children && field.children.length > 0) {
            processFields(field.children, targetObj[field.name].properties);
          }
        } else if (field.type === 'array') {
          targetObj[field.name] = {
            type: 'array',
            items: {
              type: 'object',
              properties: {},
            },
          };
          
          if (field.description) {
            targetObj[field.name].description = field.description;
          }
          
          if (field.children && field.children.length > 0) {
            processFields(field.children, targetObj[field.name].items.properties);
          }
        } else {
          targetObj[field.name] = {
            type: field.type,
          };
          
          if (field.description) {
            targetObj[field.name].description = field.description;
          }
        }
        
        if (field.required) {
          schema.required.push(field.name);
        }
      });
    };
    
    processFields(rootFields, schema.properties);
    
    if (schema.required.length === 0) {
      delete schema.required;
    }
    
    return schema;
  };

  useEffect(() => {
    const { fields: convertedFields, rootFields: convertedRootFields } = convertSchemaToFields(initialSchema);
    setFields(convertedFields);
    setRootFields(convertedRootFields);
    setSchema(initialSchema);
  }, [initialSchema]);

  return {
    fields,
    setFields,
    rootFields,
    setRootFields,
    schema,
    setSchema,
    convertSchemaToFields,
    convertFieldsToSchema
  };
};
