
import { useState } from 'react';
import { toast } from 'sonner';
import { Field } from './useSchemaConverter';

export const useSchemaFields = (initialFields = {}, initialRootFields = []) => {
  const [fields, setFields] = useState<Record<string, Field>>(initialFields);
  const [rootFields, setRootFields] = useState<string[]>(initialRootFields);

  const handleAddField = (
    newField: { name: string; type: string; description: string; required: boolean }, 
    parentId?: string
  ) => {
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
  
  const handleEditField = (
    id: string, 
    updatedField: { name: string; type: string; description: string; required: boolean }
  ) => {
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

  return {
    fields,
    setFields,
    rootFields,
    setRootFields,
    handleAddField,
    handleEditField,
    handleDeleteField
  };
};
