import {
  createFieldSchema,
  deleteSchemaProperty,
  getFieldInfo,
  setSchemaProperty,
  updateRequiredFields,
} from "@/lib/schemaEditor";
import type { JSONSchema, NewField } from "@/types/jsonSchema";
import { baseSchema } from "@/types/jsonSchema";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export function useSchemaEditor(initialSchema?: JSONSchema) {
  const [schema, setSchema] = useState<JSONSchema>(
    () => initialSchema || { type: "object", properties: {} },
  );
  const fieldInfo = useMemo(() => getFieldInfo(schema), [schema]);

  const handleAddField = useCallback(
    (newField: NewField, parentPath: string[] = []) => {
      try {
        setSchema((prevSchema) => {
          if (typeof prevSchema === "boolean") return prevSchema;
          const newPath = [...parentPath, newField.name];
          let newSchema = setSchemaProperty(
            prevSchema,
            newPath,
            createFieldSchema(newField),
          );
          if (newField.required) {
            newSchema = updateRequiredFields(newSchema, newPath, true);
          }
          return newSchema;
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add field",
        );
      }
    },
    [],
  );

  const handleEditField = useCallback(
    (path: string[], updatedField: NewField) => {
      try {
        setSchema((prevSchema) => {
          if (typeof prevSchema === "boolean") return prevSchema;
          const parentPath = path.slice(0, -1);
          const newPath = [...parentPath, updatedField.name];

          let newSchema = setSchemaProperty(
            prevSchema,
            newPath,
            createFieldSchema(updatedField),
          );

          newSchema = updateRequiredFields(newSchema, path, false);
          if (updatedField.required) {
            newSchema = updateRequiredFields(newSchema, newPath, true);
          }
          return newSchema;
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to edit field",
        );
      }
    },
    [],
  );

  const handleDeleteField = useCallback((path: string[]) => {
    setSchema((prevSchema) => deleteSchemaProperty(prevSchema, path));
  }, []);

  const handleSchemaEdit = useCallback((newSchema: JSONSchema) => {
    try {
      baseSchema.parse(newSchema);
      setSchema(newSchema);
    } catch (error) {
      toast.error("Invalid JSON Schema");
    }
  }, []);

  return {
    schema,
    fieldInfo,
    handleAddField,
    handleEditField,
    handleDeleteField,
    handleSchemaEdit,
  };
}
