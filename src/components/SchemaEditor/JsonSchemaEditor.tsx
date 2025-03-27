import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JsonSchemaVisualizer from "./JsonSchemaVisualizer";
import SchemaVisualEditor from "./SchemaVisualEditor";
import { useSchemaConverter } from "@/hooks/useSchemaConverter";
import { useSchemaFields } from "@/hooks/useSchemaFields";
import type { JSONSchemaType } from "./SchemaExample";

interface JsonSchemaEditorProps {
  initialSchema?: JSONSchemaType;
  onChange?: (schema: JSONSchemaType) => void;
  className?: string;
}

const JsonSchemaEditor: React.FC<JsonSchemaEditorProps> = ({
  initialSchema = { type: "object" },
  onChange,
  className,
}) => {
  const [activeTab, setActiveTab] = useState("visual");
  const [lastGeneratedSchema, setLastGeneratedSchema] =
    useState<JSONSchemaType>(initialSchema);

  const { fields, rootFields, schema, setSchema, convertFieldsToSchema } =
    useSchemaConverter(initialSchema);

  const { handleAddField, handleEditField, handleDeleteField } =
    useSchemaFields(fields, rootFields);

  const updateSchema = useCallback(
    (newSchema: JSONSchemaType) => {
      if (JSON.stringify(newSchema) !== JSON.stringify(lastGeneratedSchema)) {
        setLastGeneratedSchema(newSchema);
        setSchema(newSchema);
        onChange?.(newSchema);
      }
    },
    [lastGeneratedSchema, setSchema, onChange],
  );

  useEffect(() => {
    if (Object.keys(fields).length > 0) {
      const generatedSchema = convertFieldsToSchema();
      updateSchema(generatedSchema);
    }
  }, [fields, convertFieldsToSchema, updateSchema]);

  const handleSchemaDirectEdit = (editedSchema: JSONSchemaType) => {
    updateSchema(editedSchema);
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

        <TabsContent value="visual" className="focus:outline-none">
          <SchemaVisualEditor
            fields={fields}
            rootFields={rootFields}
            onAddField={handleAddField}
            onEditField={handleEditField}
            onDeleteField={handleDeleteField}
          />
        </TabsContent>

        <TabsContent value="json" className="focus:outline-none">
          <JsonSchemaVisualizer
            schema={schema}
            onChange={handleSchemaDirectEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JsonSchemaEditor;
