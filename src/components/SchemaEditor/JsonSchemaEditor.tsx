import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSchemaEditor } from "@/hooks/useSchemaEditor";
import { cn } from "@/lib/utils";
import type { JSONSchema } from "@/types/jsonSchema";
import type React from "react";
import { useEffect } from "react";
import JsonSchemaVisualizer from "./JsonSchemaVisualizer";
import SchemaVisualEditor from "./SchemaVisualEditor";

interface JsonSchemaEditorProps {
  initialSchema?: JSONSchema;
  onChange?: (schema: JSONSchema) => void;
  className?: string;
}

const JsonSchemaEditor: React.FC<JsonSchemaEditorProps> = ({
  initialSchema = { type: "object" },
  onChange,
  className,
}) => {
  const {
    schema,
    fieldInfo,
    handleAddField,
    handleEditField,
    handleDeleteField,
    handleSchemaEdit,
  } = useSchemaEditor(initialSchema);

  useEffect(() => {
    onChange?.(schema);
  }, [schema, onChange]);

  return (
    <div className={cn("json-editor-container", className)}>
      <Tabs defaultValue="visual" className="w-full">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-medium">JSON Schema Editor</h3>
          <TabsList className="grid grid-cols-2 w-[200px]">
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visual" className="focus:outline-none">
          <SchemaVisualEditor
            fieldInfo={fieldInfo}
            onAddField={handleAddField}
            onEditField={handleEditField}
            onDeleteField={handleDeleteField}
          />
        </TabsContent>

        <TabsContent value="json" className="focus:outline-none">
          <JsonSchemaVisualizer schema={schema} onChange={handleSchemaEdit} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JsonSchemaEditor;
