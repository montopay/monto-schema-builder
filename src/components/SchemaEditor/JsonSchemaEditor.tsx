
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddFieldButton from './AddFieldButton';
import SchemaField from './SchemaField';
import JsonSchemaVisualizer from './JsonSchemaVisualizer';
import { toast } from 'sonner';

interface JsonSchemaEditorProps {
  initialSchema?: any;
  onChange?: (schema: any) => void;
  className?: string;
}

type Field = {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
  parent?: string | null;
  children?: string[];
};

const JsonSchemaEditor: React.FC<JsonSchemaEditorProps> = ({
  initialSchema = {},
  onChange,
  className,
}) => {
  const [fields, setFields] = useState<Record<string, Field>>({});
  const [rootFields, setRootFields] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('visual');

  // Helper to convert schema to our internal format
  const convertSchemaToFields = (schema: any) => {
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
  
  // Helper to convert our internal format back to JSON Schema
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
  }, [initialSchema]);
  
  useEffect(() => {
    if (onChange && Object.keys(fields).length > 0) {
      const schema = convertFieldsToSchema();
      onChange(schema);
    }
  }, [fields, rootFields]);
  
  const handleAddField = (newField: { name: string; type: string; description: string; required: boolean }, parentId?: string) => {
    const id = `${parentId ? `${parentId}_` : ''}${newField.name}`;
    
    // Check if field name already exists at this level
    const isDuplicate = (parentId ? fields[parentId]?.children : rootFields)?.some(
      fieldId => fields[fieldId].name === newField.name
    );
    
    if (isDuplicate) {
      toast.error(`A field named "${newField.name}" already exists at this level`);
      return;
    }
    
    setFields(prev => ({
      ...prev,
      [id]: {
        id,
        ...newField,
        parent: parentId || null,
        children: [],
      },
    }));
    
    if (parentId) {
      setFields(prev => ({
        ...prev,
        [parentId]: {
          ...prev[parentId],
          children: [...(prev[parentId].children || []), id],
        },
      }));
    } else {
      setRootFields(prev => [...prev, id]);
    }
    
    toast.success(`Added field "${newField.name}"`);
  };
  
  const handleEditField = (id: string, updatedField: { name: string; type: string; description: string; required: boolean }) => {
    const field = fields[id];
    const parentId = field.parent;
    
    // Check if the updated field name would cause a duplicate
    if (field.name !== updatedField.name) {
      const siblings = parentId 
        ? fields[parentId].children?.filter(childId => childId !== id)
        : rootFields.filter(rootId => rootId !== id);
      
      const isDuplicate = siblings?.some(siblingId => fields[siblingId].name === updatedField.name);
      
      if (isDuplicate) {
        toast.error(`A field named "${updatedField.name}" already exists at this level`);
        return;
      }
    }
    
    setFields(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updatedField,
      },
    }));
    
    toast.success(`Updated field "${updatedField.name}"`);
  };
  
  const handleDeleteField = (id: string) => {
    const field = fields[id];
    const parentId = field.parent;
    
    // Remove field from parent's children
    if (parentId) {
      setFields(prev => ({
        ...prev,
        [parentId]: {
          ...prev[parentId],
          children: prev[parentId].children?.filter(childId => childId !== id) || [],
        },
      }));
    } else {
      setRootFields(prev => prev.filter(fieldId => fieldId !== id));
    }
    
    // Remove this field and all its children recursively
    const getAllChildrenIds = (fieldId: string): string[] => {
      const childIds = fields[fieldId].children || [];
      const allDescendants = [...childIds];
      
      childIds.forEach(childId => {
        allDescendants.push(...getAllChildrenIds(childId));
      });
      
      return allDescendants;
    };
    
    const childrenIds = getAllChildrenIds(id);
    const newFields = { ...fields };
    
    // Delete children first
    childrenIds.forEach(childId => {
      delete newFields[childId];
    });
    
    // Delete the field itself
    delete newFields[id];
    setFields(newFields);
    
    toast.success(`Deleted field "${field.name}"`);
  };
  
  const renderFieldsRecursively = (fieldIds: string[], depth = 0) => {
    return fieldIds.map(id => {
      const field = fields[id];
      const hasChildren = field.children && field.children.length > 0;
      
      return (
        <SchemaField
          key={id}
          name={field.name}
          type={field.type}
          description={field.description}
          required={field.required}
          onDelete={() => handleDeleteField(id)}
          onEdit={(updatedField) => handleEditField(id, updatedField)}
          isNested={depth > 0}
          depth={depth}
        >
          {hasChildren && renderFieldsRecursively(field.children || [], depth + 1)}
          
          {(field.type === 'object' || field.type === 'array') && (
            <div className="mt-3 ml-4">
              <AddFieldButton
                onAddField={(newField) => handleAddField(newField, id)}
                variant="secondary"
              />
            </div>
          )}
        </SchemaField>
      );
    });
  };

  return (
    <div className={cn("json-editor-container", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-medium">JSON Schema Editor</h3>
          <TabsList className="grid grid-cols-2 w-[200px]">
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="visual" className="p-4 focus:outline-none">
          <div className="mb-6">
            <AddFieldButton onAddField={(field) => handleAddField(field)} />
          </div>
          
          {rootFields.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-3">No fields defined yet</p>
              <p className="text-sm">Add your first field to get started</p>
            </div>
          ) : (
            <div className="space-y-2 animate-in">
              {renderFieldsRecursively(rootFields)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="json" className="focus:outline-none">
          <JsonSchemaVisualizer schema={convertFieldsToSchema()} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JsonSchemaEditor;
