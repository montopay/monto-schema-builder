import { useState } from "react";
import { toast } from "sonner";
import type { Field, NewField, SchemaFieldsState } from "@/types/schema";

export const useSchemaFields = (
  initialFields: Record<string, Field> = {},
  initialRootFields: string[] = [],
): SchemaFieldsState => {
  const [fields, setFields] = useState<Record<string, Field>>(initialFields);
  const [rootFields, setRootFields] = useState<string[]>(initialRootFields);

  const handleAddField = (newField: NewField, parentId?: string) => {
    const id = `${parentId ? `${parentId}_` : ""}${newField.name}`;

    // Check if parent exists if parentId is provided
    if (parentId && !fields[parentId]) {
      toast.error(`Parent field "${parentId}" does not exist`);
      return;
    }

    // Check if field name already exists at this level
    const siblings = parentId ? fields[parentId].children : rootFields;
    const isDuplicate = siblings.some((fieldId) => fields[fieldId].name === newField.name);

    if (isDuplicate) {
      toast.error(`A field named "${newField.name}" already exists at this level`);
      return;
    }

    // Create new field with strict typing
    const field: Field = {
      id,
      ...newField,
      parent: parentId || null,
      children: [],
    };

    // Update fields state
    setFields((prev) => ({
      ...prev,
      [id]: field,
      ...(parentId && {
        [parentId]: {
          ...prev[parentId],
          children: [...prev[parentId].children, id],
        },
      }),
    }));

    // Update root fields if no parent
    if (!parentId) {
      setRootFields((prev) => [...prev, id]);
    }

    toast.success(`Added field "${newField.name}"`);
  };

  const handleEditField = (id: string, updatedField: NewField) => {
    const field = fields[id];
    if (!field) {
      toast.error(`Field "${id}" does not exist`);
      return;
    }

    const parentId = field.parent;
    const siblings = parentId
      ? fields[parentId].children.filter((childId) => childId !== id)
      : rootFields.filter((rootId) => rootId !== id);

    // Check for duplicates only if name is changing
    if (field.name !== updatedField.name) {
      const isDuplicate = siblings.some(
        (siblingId) => fields[siblingId].name === updatedField.name,
      );

      if (isDuplicate) {
        toast.error(
          `A field named "${updatedField.name}" already exists at this level`,
        );
        return;
      }
    }

    setFields((prev) => ({
      ...prev,
      [id]: {
        ...field,
        ...updatedField,
      },
    }));

    toast.success(`Updated field "${updatedField.name}"`);
  };

  const handleDeleteField = (id: string) => {
    const field = fields[id];
    if (!field) {
      toast.error(`Field "${id}" does not exist`);
      return;
    }

    const parentId = field.parent;

    // Remove field from parent's children if it has a parent
    if (parentId) {
      setFields((prev) => ({
        ...prev,
        [parentId]: {
          ...prev[parentId],
          children: prev[parentId].children.filter((childId) => childId !== id),
        },
      }));
    } else {
      setRootFields((prev) => prev.filter((fieldId) => fieldId !== id));
    }

    // Remove this field and all its children recursively
    const getAllChildrenIds = (fieldId: string): string[] => {
      const childIds = fields[fieldId].children;
      const allDescendants = [...childIds];

      for (const childId of childIds) {
        allDescendants.push(...getAllChildrenIds(childId));
      }

      return allDescendants;
    };

    const childrenIds = getAllChildrenIds(id);
    const newFields = { ...fields };

    // Delete children first
    for (const childId of childrenIds) {
      delete newFields[childId];
    }

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
    handleDeleteField,
  };
};
