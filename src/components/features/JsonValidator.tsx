import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JSONSchema } from "@/types/jsonSchema";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { Loader2 } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";

interface JsonValidatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: JSONSchema;
}

// Initialize Ajv with all supported formats
const ajv = new Ajv({
  allErrors: true,
  strict: false,
});
addFormats(ajv);

export function JsonValidator({
  open,
  onOpenChange,
  schema,
}: JsonValidatorProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors?: string[];
  } | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const validateJsonAgainstSchema = useCallback(() => {
    if (!jsonInput.trim()) {
      setValidationResult(null);
      return;
    }
    
    try {
      const jsonObject = JSON.parse(jsonInput);

      // Use Ajv to validate the JSON against the schema
      const validate = ajv.compile(schema);
      const valid = validate(jsonObject);

      if (!valid) {
        const errors =
          validate.errors?.map((error) => {
            const path = error.instancePath || "/";
            return `${path} ${error.message}`;
          }) || [];

        setValidationResult({
          valid: false,
          errors,
        });
      } else {
        setValidationResult({
          valid: true,
          errors: [],
        });
      }
    } catch (error) {
      console.error("Invalid JSON input:", error);
      setValidationResult({
        valid: false,
        errors: ["Invalid JSON format. Please check your input."],
      });
    }
  }, [jsonInput, schema]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      validateJsonAgainstSchema();
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [validateJsonAgainstSchema]);

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemaValidation: "error",
    });
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    setJsonInput(value || "");
  };

  const handleClose = () => {
    setJsonInput("");
    setValidationResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Validate JSON</DialogTitle>
          <DialogDescription>
            Paste your JSON document to validate against the current schema. Validation occurs automatically as you type.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col md:flex-row gap-4 py-4 overflow-hidden h-[600px]">
          <div className="flex-1 flex flex-col h-full">
            <div className="text-sm font-medium mb-2">Your JSON:</div>
            <div className="border rounded-md flex-1 h-full">
              <Editor
                height="600px"
                defaultLanguage="json"
                value={jsonInput}
                onChange={handleEditorChange}
                beforeMount={handleBeforeMount}
                onMount={handleEditorDidMount}
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

          <div className="flex-1 flex flex-col h-full">
            <div className="text-sm font-medium mb-2">Current Schema:</div>
            <div className="border rounded-md flex-1 h-full">
              <Editor
                height="600px"
                defaultLanguage="json"
                value={JSON.stringify(schema, null, 2)}
                beforeMount={handleBeforeMount}
                loading={
                  <div className="flex items-center justify-center h-full w-full bg-secondary/30">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                }
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  readOnly: true,
                  automaticLayout: true,
                  folding: true,
                  foldingStrategy: "indentation",
                }}
                theme="light"
              />
            </div>
          </div>
        </div>

        {validationResult && !validationResult.valid && (
          <div className="text-sm text-destructive space-y-1 border-t pt-4">
            <p className="font-semibold">Validation errors:</p>
            <ul className="list-disc pl-5">
              {validationResult.errors?.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {validationResult?.valid && (
          <div className="text-sm text-green-500 font-semibold border-t pt-4">
            JSON is valid according to the schema! ✓
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={validateJsonAgainstSchema}>Validate Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
