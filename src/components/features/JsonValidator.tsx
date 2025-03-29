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
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

interface ValidationError {
  path: string;
  message: string;
  line?: number;
  column?: number;
}

export function JsonValidator({
  open,
  onOpenChange,
  schema,
}: JsonValidatorProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors?: ValidationError[];
  } | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const findLineNumberForPath = useCallback(
    (
      jsonStr: string,
      path: string,
    ): { line: number; column: number } | undefined => {
      if (!editorRef.current) return undefined;

      try {
        // For root errors
        if (path === "/" || path === "") {
          return { line: 1, column: 1 };
        }

        const model = editorRef.current.getModel();
        if (!model) return undefined;

        // Convert the path to an array of segments
        const pathSegments = path.split("/").filter(Boolean);
        let currentObj = JSON.parse(jsonStr);
        let currentPath = "";
        const jsonStr2 = jsonStr;

        // Navigate to the last valid object before the error
        for (const segment of pathSegments) {
          currentPath += `/${segment}`;
          const searchStr =
            typeof currentObj[segment] === "object"
              ? `"${segment}": `
              : `"${segment}"`;

          const index = jsonStr2.indexOf(searchStr);
          if (index > -1) {
            const upToError = jsonStr2.substring(0, index + searchStr.length);
            const lineCount = upToError.split("\n").length;
            const lastNewLinePos = upToError.lastIndexOf("\n");
            const columnPos =
              lastNewLinePos === -1
                ? upToError.length + 1
                : upToError.length - lastNewLinePos;

            return {
              line: lineCount,
              column: columnPos,
            };
          }

          if (typeof currentObj[segment] === "undefined") break;
          currentObj = currentObj[segment];
        }

        return undefined;
      } catch (error) {
        console.error("Error finding line number:", error);
        return undefined;
      }
    },
    [],
  );

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
            const position = findLineNumberForPath(jsonInput, path);
            return {
              path,
              message: error.message || "Unknown error",
              line: position?.line,
              column: position?.column,
            };
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

      // Try to extract line and column from SyntaxError message
      let line = 1;
      let column = 1;
      const errorMessage = (error as Error).message;
      const positionMatch = errorMessage.match(/position (\d+)/);

      if (positionMatch?.[1]) {
        const position = Number.parseInt(positionMatch[1], 10);
        const jsonUpToError = jsonInput.substring(0, position);
        const lines = jsonUpToError.split("\n");
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      setValidationResult({
        valid: false,
        errors: [
          {
            path: "/",
            message: "Invalid JSON format. Please check your syntax.",
            line,
            column,
          },
        ],
      });
    }
  }, [jsonInput, schema, findLineNumberForPath]);

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

  const goToError = (line: number, column: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: column });
      editorRef.current.focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Validate JSON</DialogTitle>
          <DialogDescription>
            Paste your JSON document to validate against the current schema.
            Validation occurs automatically as you type.
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

        {validationResult && (
          <div
            className={`rounded-md p-4 ${validationResult.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"} transition-all duration-300 ease-in-out`}
          >
            <div className="flex items-center">
              {validationResult.valid ? (
                <>
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700 font-medium">
                    JSON is valid according to the schema!
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700 font-medium">
                    Validation errors detected
                  </p>
                </>
              )}
            </div>

            {!validationResult.valid &&
              validationResult.errors &&
              validationResult.errors.length > 0 && (
                <div className="mt-3 max-h-[200px] overflow-y-auto">
                  <ul className="space-y-2">
                    {validationResult.errors.map((error, index) => (
                      <button
                        key={`error-${error.path}-${index}`}
                        type="button"
                        className="w-full text-left bg-white border border-red-100 rounded-md p-3 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() =>
                          error.line &&
                          error.column &&
                          goToError(error.line, error.column)
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-700">
                              {error.path === "/" ? "Root" : error.path}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {error.message}
                            </p>
                          </div>
                          {error.line && (
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              Line {error.line}
                              {error.column ? `, Col ${error.column}` : ""}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </ul>
                </div>
              )}
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
