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
import {
  type ValidationError,
  type ValidationResult,
  validateJson,
} from "@/utils/jsonValidator";
import { useMonacoTheme } from "@/hooks/use-monaco-theme";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import type * as Monaco from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";

interface JsonValidatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: JSONSchema;
}

export function JsonValidator({
  open,
  onOpenChange,
  schema,
}: JsonValidatorProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const {
    currentTheme,
    defineMonacoThemes,
    configureJsonDefaults,
    defaultEditorOptions,
  } = useMonacoTheme();

  const validateJsonAgainstSchema = useCallback(() => {
    if (!jsonInput.trim()) {
      setValidationResult(null);
      return;
    }

    const result = validateJson(jsonInput, schema);
    setValidationResult(result);
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

  const handleJsonEditorBeforeMount: BeforeMount = (monaco) => {
    monacoRef.current = monaco;
    defineMonacoThemes(monaco);
    configureJsonDefaults(monaco, schema);
  };

  const handleSchemaEditorBeforeMount: BeforeMount = (monaco) => {
    defineMonacoThemes(monaco);
    configureJsonDefaults(monaco);
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

  // Create a modified version of defaultEditorOptions for the editor
  const editorOptions = {
    ...defaultEditorOptions,
    readOnly: false,
  };

  // Create read-only options for the schema viewer
  const schemaViewerOptions = {
    ...defaultEditorOptions,
    readOnly: true,
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
                beforeMount={handleJsonEditorBeforeMount}
                onMount={handleEditorDidMount}
                loading={
                  <div className="flex items-center justify-center h-full w-full bg-secondary/30">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                }
                options={editorOptions}
                theme={currentTheme}
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
                beforeMount={handleSchemaEditorBeforeMount}
                loading={
                  <div className="flex items-center justify-center h-full w-full bg-secondary/30">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                }
                options={schemaViewerOptions}
                theme={currentTheme}
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
                  {validationResult.errors[0] && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-700">
                        {validationResult.errors[0].path === "/"
                          ? "Root"
                          : validationResult.errors[0].path}
                      </span>
                      {validationResult.errors[0].line && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          Line {validationResult.errors[0].line}
                          {validationResult.errors[0].column
                            ? `, Col ${validationResult.errors[0].column}`
                            : ""}
                        </span>
                      )}
                    </div>
                  )}
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
      </DialogContent>
    </Dialog>
  );
}
