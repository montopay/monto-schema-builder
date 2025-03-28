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
    <div className={cn("json-editor-container w-full", className)}>
      {/* For mobile screens - show as tabs */}
      <div className="block lg:hidden w-full">
        <Tabs defaultValue="visual" className="w-full">
          <div className="flex items-center justify-between px-4 py-3 border-b w-full">
            <h3 className="font-medium">JSON Schema Editor</h3>
            <TabsList className="grid grid-cols-2 w-[200px]">
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="visual"
            className="focus:outline-none w-full h-[500px]"
          >
            <SchemaVisualEditor schema={schema} onChange={handleSchemaChange} />
          </TabsContent>

          <TabsContent
            value="json"
            className="focus:outline-none w-full h-[500px]"
          >
            <JsonSchemaVisualizer
              schema={schema}
              onChange={handleSchemaChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* For large screens - show side by side */}
      <div className="hidden lg:flex lg:flex-col w-full h-[600px]">
        <div className="flex items-center px-4 py-3 border-b w-full flex-shrink-0">
          <h3 className="font-medium">JSON Schema Editor</h3>
        </div>
        <div className="flex flex-row w-full flex-grow min-h-0">
          <div className="w-1/2 border-r h-full min-h-0">
            <SchemaVisualEditor schema={schema} onChange={handleSchemaChange} />
          </div>
          <div className="w-1/2 h-full min-h-0">
            <JsonSchemaVisualizer
              schema={schema}
              onChange={handleSchemaChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonSchemaEditor;
