import { useEffect, useState } from "react";
const defaultEditorOptions = {
    minimap: {
        enabled: false
    },
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
        indentation: true
    }
};
function useMonacoTheme() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(()=>{
        const checkDarkMode = ()=>{
            const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
            const isDark = backgroundColor.includes("222.2") || backgroundColor.includes("84% 4.9%");
            setIsDarkMode(isDark);
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: [
                "class",
                "style"
            ]
        });
        return ()=>observer.disconnect();
    }, []);
    const defineMonacoThemes = (monaco)=>{
        monaco.editor.defineTheme("appLightTheme", {
            base: "vs",
            inherit: true,
            rules: [
                {
                    token: "string",
                    foreground: "3B82F6"
                },
                {
                    token: "number",
                    foreground: "A855F7"
                },
                {
                    token: "keyword",
                    foreground: "3B82F6"
                },
                {
                    token: "delimiter",
                    foreground: "0F172A"
                },
                {
                    token: "keyword.json",
                    foreground: "A855F7"
                },
                {
                    token: "string.key.json",
                    foreground: "2563EB"
                },
                {
                    token: "string.value.json",
                    foreground: "3B82F6"
                },
                {
                    token: "boolean",
                    foreground: "22C55E"
                },
                {
                    token: "null",
                    foreground: "64748B"
                }
            ],
            colors: {
                "editor.background": "#f8fafc",
                "editor.foreground": "#0f172a",
                "editorCursor.foreground": "#0f172a",
                "editor.lineHighlightBackground": "#f1f5f9",
                "editorLineNumber.foreground": "#64748b",
                "editor.selectionBackground": "#e2e8f0",
                "editor.inactiveSelectionBackground": "#e2e8f0",
                "editorIndentGuide.background": "#e2e8f0",
                "editor.findMatchBackground": "#cbd5e1",
                "editor.findMatchHighlightBackground": "#cbd5e133"
            }
        });
        monaco.editor.defineTheme("appDarkTheme", {
            base: "vs-dark",
            inherit: true,
            rules: [
                {
                    token: "string",
                    foreground: "3B82F6"
                },
                {
                    token: "number",
                    foreground: "A855F7"
                },
                {
                    token: "keyword",
                    foreground: "3B82F6"
                },
                {
                    token: "delimiter",
                    foreground: "F8FAFC"
                },
                {
                    token: "keyword.json",
                    foreground: "A855F7"
                },
                {
                    token: "string.key.json",
                    foreground: "60A5FA"
                },
                {
                    token: "string.value.json",
                    foreground: "3B82F6"
                },
                {
                    token: "boolean",
                    foreground: "22C55E"
                },
                {
                    token: "null",
                    foreground: "94A3B8"
                }
            ],
            colors: {
                "editor.background": "#0f172a",
                "editor.foreground": "#f8fafc",
                "editorCursor.foreground": "#f8fafc",
                "editor.lineHighlightBackground": "#1e293b",
                "editorLineNumber.foreground": "#64748b",
                "editor.selectionBackground": "#334155",
                "editor.inactiveSelectionBackground": "#334155",
                "editorIndentGuide.background": "#1e293b",
                "editor.findMatchBackground": "#475569",
                "editor.findMatchHighlightBackground": "#47556933"
            }
        });
    };
    const configureJsonDefaults = (monaco, schema)=>{
        const diagnosticsOptions = {
            validate: true,
            allowComments: false,
            schemaValidation: "error",
            enableSchemaRequest: true,
            schemas: schema ? [
                {
                    uri: "object" == typeof schema && schema.$id ? schema.$id : "https://jsonjoy-builder/schema",
                    fileMatch: [
                        "*"
                    ],
                    schema
                }
            ] : [
                {
                    uri: "http://json-schema.org/draft-07/schema",
                    fileMatch: [
                        "*"
                    ],
                    schema: {
                        $schema: "http://json-schema.org/draft-07/schema",
                        type: "object",
                        additionalProperties: true
                    }
                }
            ]
        };
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions(diagnosticsOptions);
    };
    return {
        isDarkMode,
        currentTheme: isDarkMode ? "appDarkTheme" : "appLightTheme",
        defineMonacoThemes,
        configureJsonDefaults,
        defaultEditorOptions
    };
}
export { defaultEditorOptions, useMonacoTheme };
