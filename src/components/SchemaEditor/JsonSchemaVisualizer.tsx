import { cn } from "@/lib/utils";
import type { JSONSchema } from "@/types/jsonSchema";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { FileJson, Loader2 } from "lucide-react";
import type React from "react";
import { useRef } from "react";

interface JsonSchemaVisualizerProps {
  schema: JSONSchema;
  className?: string;
  onChange?: (schema: JSONSchema) => void;
}

const JsonSchemaVisualizer: React.FC<JsonSchemaVisualizerProps> = ({
  schema,
  className,
  onChange,
}) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemaValidation: "error",
      schemas: [
        {
          uri: "http://json-schema.org/draft-07/schema",
          fileMatch: ["*"],
          schema: {
            $schema: "http://json-schema.org/draft-07/schema",
            type: "object",
            additionalProperties: true,
          },
        },
      ],
    });
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;

    try {
      const parsedJson = JSON.parse(value);
      if (onChange) {
        onChange(parsedJson);
      }
    } catch (error) {
      // Monaco will show the error inline, no need for additional error handling
    }
  };

  return (
    <div className={cn("relative rounded-lg overflow-hidden h-full flex flex-col", className)}>
      <div className="flex items-center justify-between bg-secondary/80 backdrop-blur-sm px-4 py-2 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileJson size={18} />
          <span className="font-medium text-sm">JSON Schema</span>
        </div>
      </div>
      <div className="flex-grow flex min-h-0">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={JSON.stringify(schema, null, 2)}
          onChange={handleEditorChange}
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          className="monaco-editor-container w-full h-full"
          loading={
            <div className="flex items-center justify-center h-full w-full bg-secondary/30">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            folding: true,
            foldingStrategy: "indentation",
            renderLineHighlight: "all",
            matchBrackets: "always",
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
          theme="light"
        />
      </div>
    </div>
  );
};

export default JsonSchemaVisualizer;
