import { jsx, jsxs } from "react/jsx-runtime";
import react from "@monaco-editor/react";
import { Download, FileJson, Loader2 } from "lucide-react";
import { useRef } from "react";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.js";
import { cn } from "../../lib/utils.js";
import { useTranslation } from "../../hooks/use-translation.js";
const JsonSchemaVisualizer_JsonSchemaVisualizer = ({ schema, className, onChange })=>{
    const editorRef = useRef(null);
    const { currentTheme, defineMonacoThemes, configureJsonDefaults, defaultEditorOptions } = useMonacoTheme();
    const t = useTranslation();
    const handleBeforeMount = (monaco)=>{
        defineMonacoThemes(monaco);
        configureJsonDefaults(monaco);
    };
    const handleEditorDidMount = (editor)=>{
        editorRef.current = editor;
        editor.focus();
    };
    const handleEditorChange = (value)=>{
        if (!value) return;
        try {
            const parsedJson = JSON.parse(value);
            if (onChange) onChange(parsedJson);
        } catch (_error) {}
    };
    const handleDownload = ()=>{
        const content = JSON.stringify(schema, null, 2);
        const blob = new Blob([
            content
        ], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = t.visualizerDownloadFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    return /*#__PURE__*/ jsxs("div", {
        className: cn("relative overflow-hidden h-full flex flex-col", className, "jsonjoy"),
        children: [
            /*#__PURE__*/ jsxs("div", {
                className: "flex items-center justify-between bg-secondary/80 backdrop-blur-xs px-4 py-2 border-b shrink-0",
                children: [
                    /*#__PURE__*/ jsxs("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ jsx(FileJson, {
                                size: 18
                            }),
                            /*#__PURE__*/ jsx("span", {
                                className: "font-medium text-sm",
                                children: t.visualizerSource
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsx("button", {
                        type: "button",
                        onClick: handleDownload,
                        className: "p-1.5 hover:bg-secondary rounded-md transition-colors",
                        title: t.visualizerDownloadTitle,
                        children: /*#__PURE__*/ jsx(Download, {
                            size: 16
                        })
                    })
                ]
            }),
            /*#__PURE__*/ jsx("div", {
                className: "grow flex min-h-0",
                children: /*#__PURE__*/ jsx(react, {
                    height: "100%",
                    defaultLanguage: "json",
                    value: JSON.stringify(schema, null, 2),
                    onChange: handleEditorChange,
                    beforeMount: handleBeforeMount,
                    onMount: handleEditorDidMount,
                    className: "monaco-editor-container w-full h-full",
                    loading: /*#__PURE__*/ jsx("div", {
                        className: "flex items-center justify-center h-full w-full bg-secondary/30",
                        children: /*#__PURE__*/ jsx(Loader2, {
                            className: "h-6 w-6 animate-spin"
                        })
                    }),
                    options: defaultEditorOptions,
                    theme: currentTheme
                })
            })
        ]
    });
};
const JsonSchemaVisualizer = JsonSchemaVisualizer_JsonSchemaVisualizer;
export { JsonSchemaVisualizer as default };
