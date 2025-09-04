import { jsx, jsxs } from "react/jsx-runtime";
import react from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../ui/button.js";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog.js";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.js";
import { createSchemaFromJson } from "../../lib/schema-inference.js";
import { useTranslation } from "../../hooks/use-translation.js";
function SchemaInferencer({ open, onOpenChange, onSchemaInferred }) {
    const t = useTranslation();
    const [jsonInput, setJsonInput] = useState("");
    const [error, setError] = useState(null);
    const editorRef = useRef(null);
    const { currentTheme, defineMonacoThemes, configureJsonDefaults, defaultEditorOptions } = useMonacoTheme();
    const handleBeforeMount = (monaco)=>{
        defineMonacoThemes(monaco);
        configureJsonDefaults(monaco);
    };
    const handleEditorDidMount = (editor)=>{
        editorRef.current = editor;
        editor.focus();
    };
    const handleEditorChange = (value)=>{
        setJsonInput(value || "");
    };
    const inferSchemaFromJson = ()=>{
        try {
            const jsonObject = JSON.parse(jsonInput);
            setError(null);
            const inferredSchema = createSchemaFromJson(jsonObject);
            onSchemaInferred(inferredSchema);
            onOpenChange(false);
        } catch (error) {
            console.error("Invalid JSON input:", error);
            setError(t.inferrerErrorInvalidJson);
        }
    };
    const handleClose = ()=>{
        setJsonInput("");
        setError(null);
        onOpenChange(false);
    };
    return /*#__PURE__*/ jsx(Dialog, {
        open: open,
        onOpenChange: onOpenChange,
        children: /*#__PURE__*/ jsxs(DialogContent, {
            className: "sm:max-w-4xl max-h-[90vh] flex flex-col jsonjoy",
            children: [
                /*#__PURE__*/ jsxs(DialogHeader, {
                    children: [
                        /*#__PURE__*/ jsx(DialogTitle, {
                            children: t.inferrerTitle
                        }),
                        /*#__PURE__*/ jsx(DialogDescription, {
                            children: t.inferrerDescription
                        })
                    ]
                }),
                /*#__PURE__*/ jsxs("div", {
                    className: "flex-1 min-h-0 py-4 flex flex-col",
                    children: [
                        /*#__PURE__*/ jsx("div", {
                            className: "border rounded-md flex-1 overflow-hidden h-full",
                            children: /*#__PURE__*/ jsx(react, {
                                height: "450px",
                                defaultLanguage: "json",
                                value: jsonInput,
                                onChange: handleEditorChange,
                                beforeMount: handleBeforeMount,
                                onMount: handleEditorDidMount,
                                options: defaultEditorOptions,
                                theme: currentTheme,
                                loading: /*#__PURE__*/ jsx("div", {
                                    className: "flex items-center justify-center h-full w-full bg-secondary/30",
                                    children: /*#__PURE__*/ jsx(Loader2, {
                                        className: "h-6 w-6 animate-spin"
                                    })
                                })
                            })
                        }),
                        error && /*#__PURE__*/ jsx("p", {
                            className: "text-sm text-destructive mt-2",
                            children: error
                        })
                    ]
                }),
                /*#__PURE__*/ jsxs(DialogFooter, {
                    children: [
                        /*#__PURE__*/ jsx(Button, {
                            type: "button",
                            variant: "outline",
                            onClick: handleClose,
                            children: t.inferrerCancel
                        }),
                        /*#__PURE__*/ jsx(Button, {
                            type: "button",
                            onClick: inferSchemaFromJson,
                            children: t.inferrerGenerate
                        })
                    ]
                })
            ]
        })
    });
}
export { SchemaInferencer };
