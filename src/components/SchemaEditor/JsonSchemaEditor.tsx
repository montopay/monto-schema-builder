import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { JSONSchema } from "@/types/jsonSchema";
import { Maximize2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import JsonSchemaVisualizer from "./JsonSchemaVisualizer";
import SchemaVisualEditor from "./SchemaVisualEditor";

interface JsonSchemaEditorProps {
  schema?: JSONSchema;
  setSchema?: (schema: JSONSchema) => void;
  className?: string;
}

const JsonSchemaEditor: React.FC<JsonSchemaEditorProps> = ({
  schema = { type: "object" },
  setSchema,
  className,
}) => {
  // Handle schema changes and propagate to parent if needed
  const handleSchemaChange = (newSchema: JSONSchema) => {
    setSchema(newSchema);
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const fullscreenClass = isFullscreen
    ? "fixed inset-0 z-50 bg-background"
    : "";

  return (
    <div
      className={cn("json-editor-container w-full", fullscreenClass, className)}
    >
      {/* For mobile screens - show as tabs */}
      <div className="block lg:hidden w-full">
        <Tabs defaultValue="visual" className="w-full">
          <div className="flex items-center justify-between px-4 py-3 border-b w-full">
            <h3 className="font-medium">JSON Schema Editor</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                aria-label="Toggle fullscreen"
              >
                <Maximize2 size={16} />
              </button>
              <TabsList className="grid grid-cols-2 w-[200px]">
                <TabsTrigger value="visual">Visual</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent
            value="visual"
            className={cn(
              "focus:outline-none w-full",
              isFullscreen ? "h-screen" : "h-[500px]",
            )}
          >
            <SchemaVisualEditor schema={schema} onChange={handleSchemaChange} />
          </TabsContent>

          <TabsContent
            value="json"
            className={cn(
              "focus:outline-none w-full",
              isFullscreen ? "h-screen" : "h-[500px]",
            )}
          >
            <JsonSchemaVisualizer
              schema={schema}
              onChange={handleSchemaChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* For large screens - show side by side */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col w-full",
          isFullscreen ? "h-screen" : "h-[600px]",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b w-full flex-shrink-0">
          <h3 className="font-medium">JSON Schema Editor</h3>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 size={16} />
          </button>
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
