import { useEffect, useState } from "react";
import type * as Monaco from "monaco-editor";
import type { JSONSchema } from "@/types/jsonSchema";

export interface MonacoEditorOptions {
  minimap?: { enabled: boolean };
  fontSize?: number;
  fontFamily?: string;
  lineNumbers?: "on" | "off";
  roundedSelection?: boolean;
  scrollBeyondLastLine?: boolean;
  readOnly?: boolean;
  automaticLayout?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
  tabSize?: number;
  insertSpaces?: boolean;
  detectIndentation?: boolean;
  folding?: boolean;
  foldingStrategy?: "auto" | "indentation";
  renderLineHighlight?: "all" | "line" | "none" | "gutter";
  matchBrackets?: "always" | "near" | "never";
  autoClosingBrackets?:
    | "always"
    | "languageDefined"
    | "beforeWhitespace"
    | "never";
  autoClosingQuotes?:
    | "always"
    | "languageDefined"
    | "beforeWhitespace"
    | "never";
  guides?: {
    bracketPairs?: boolean;
    indentation?: boolean;
  };
}

export const defaultEditorOptions: MonacoEditorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "var(--font-sans), 'SF Mono', Monaco, Menlo, Consolas, monospace",
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
};

export function useMonacoTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode by examining CSS variables
  useEffect(() => {
    const checkDarkMode = () => {
      // Get the current background color value
      const backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim();

      // If the background color HSL has a low lightness value, it's likely dark mode
      const isDark =
        backgroundColor.includes("222.2") ||
        backgroundColor.includes("84% 4.9%");

      setIsDarkMode(isDark);
    };

    // Check initially
    checkDarkMode();

    // Set up a mutation observer to detect theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => observer.disconnect();
  }, []);

  const defineMonacoThemes = (monaco: typeof Monaco) => {
    // Define custom light theme that matches app colors
    monaco.editor.defineTheme("appLightTheme", {
      base: "vs",
      inherit: true,
      rules: [
        // JSON syntax highlighting
        { token: "string", foreground: "0F76C8" }, // strings in blue
        { token: "number", foreground: "C23786" }, // numbers in pink
        { token: "keyword", foreground: "0F76C8" }, // keywords in blue
        { token: "delimiter", foreground: "000000" }, // delimiters in black
        { token: "keyword.json", foreground: "C23786" }, // JSON specific keywords in pink
        { token: "string.key.json", foreground: "064D7D" }, // JSON property names in darker blue
        { token: "string.value.json", foreground: "0F76C8" }, // JSON string values in blue
        { token: "boolean", foreground: "C23786" }, // booleans in pink
        { token: "null", foreground: "C23786" }, // null in pink
      ],
      colors: {
        "editor.background": "#f8fafc", // Light background matching app
        "editor.foreground": "#0f172a", // Matching app text color
        "editorCursor.foreground": "#0f172a",
        "editor.lineHighlightBackground": "#f1f5f9",
        "editorLineNumber.foreground": "#64748b",
        "editor.selectionBackground": "#e2e8f0",
        "editor.inactiveSelectionBackground": "#e2e8f0",
        "editorIndentGuide.background": "#e2e8f0",
        "editor.findMatchBackground": "#EAEAF2",
        "editor.findMatchHighlightBackground": "#EAEAF240",
      },
    });

    // Define custom dark theme that matches app colors
    monaco.editor.defineTheme("appDarkTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        // JSON syntax highlighting
        { token: "string", foreground: "6DB0F5" }, // strings in light blue
        { token: "number", foreground: "E886C4" }, // numbers in pink
        { token: "keyword", foreground: "6DB0F5" }, // keywords in light blue
        { token: "delimiter", foreground: "D4D4D4" }, // delimiters in light gray
        { token: "keyword.json", foreground: "E886C4" }, // JSON specific keywords in pink
        { token: "string.key.json", foreground: "89DDFF" }, // JSON property names in cyan
        { token: "string.value.json", foreground: "6DB0F5" }, // JSON string values in light blue
        { token: "boolean", foreground: "E886C4" }, // booleans in pink
        { token: "null", foreground: "E886C4" }, // null in pink
      ],
      colors: {
        "editor.background": "#0f172a", // Dark background matching app
        "editor.foreground": "#f8fafc", // Matching app text color
        "editorCursor.foreground": "#f8fafc",
        "editor.lineHighlightBackground": "#1e293b",
        "editorLineNumber.foreground": "#64748b",
        "editor.selectionBackground": "#334155",
        "editor.inactiveSelectionBackground": "#334155",
        "editorIndentGuide.background": "#1e293b",
        "editor.findMatchBackground": "#515C70",
        "editor.findMatchHighlightBackground": "#515C7044",
      },
    });
  };

  // Helper to configure JSON language validation
  const configureJsonDefaults = (
    monaco: typeof Monaco,
    schema?: JSONSchema,
  ) => {
    // Create a new diagnostics options object
    const diagnosticsOptions: Monaco.languages.json.DiagnosticsOptions = {
      validate: true,
      allowComments: false,
      schemaValidation: "error",
      schemas: schema
        ? [
            {
              uri:
                typeof schema === "object" && schema.$id
                  ? schema.$id
                  : "https://jsonjoy-builder/schema",
              fileMatch: ["*"],
              schema,
            },
          ]
        : [
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
    };

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
      diagnosticsOptions,
    );
  };

  return {
    isDarkMode,
    currentTheme: isDarkMode ? "appDarkTheme" : "appLightTheme",
    defineMonacoThemes,
    configureJsonDefaults,
    defaultEditorOptions,
  };
}
