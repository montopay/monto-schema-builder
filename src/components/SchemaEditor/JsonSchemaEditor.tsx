import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { JSONSchema } from "@/types/jsonSchema";
import type React from "react";
import { useState } from "react";
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
  const [schema, setSchema] = useState<JSONSchema>(initialSchema);

  // Handle schema changes and propagate to parent if needed
  const handleSchemaChange = (newSchema: JSONSchema) => {
    setSchema(newSchema);
    onChange?.(newSchema);
  };

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
          <SchemaVisualEditor schema={schema} onChange={handleSchemaChange} />
        </TabsContent>

        <TabsContent value="json" className="focus:outline-none">
          <JsonSchemaVisualizer schema={schema} onChange={handleSchemaChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JsonSchemaEditor;
