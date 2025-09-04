import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import react from "@monaco-editor/react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog.js";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.js";
import { validateJson } from "../../utils/jsonValidator.js";
import { formatTranslation, useTranslation } from "../../hooks/use-translation.js";
function JsonValidator({ open, onOpenChange, schema }) {
    const t = useTranslation();
    const [jsonInput, setJsonInput] = useState("");
    const [validationResult, setValidationResult] = useState(null);
    const editorRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const monacoRef = useRef(null);
    const schemaMonacoRef = useRef(null);
    const { currentTheme, defineMonacoThemes, configureJsonDefaults, defaultEditorOptions } = useMonacoTheme();
    const validateJsonAgainstSchema = useCallback(()=>{
        if (!jsonInput.trim()) return void setValidationResult(null);
        const result = validateJson(jsonInput, schema);
        setValidationResult(result);
    }, [
        jsonInput,
        schema
    ]);
    useEffect(()=>{
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(()=>{
            validateJsonAgainstSchema();
        }, 500);
        return ()=>{
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [
        validateJsonAgainstSchema
    ]);
    const handleJsonEditorBeforeMount = (monaco)=>{
        monacoRef.current = monaco;
        defineMonacoThemes(monaco);
        configureJsonDefaults(monaco, schema);
    };
    const handleSchemaEditorBeforeMount = (monaco)=>{
        schemaMonacoRef.current = monaco;
        defineMonacoThemes(monaco);
    };
    const handleEditorDidMount = (editor)=>{
        editorRef.current = editor;
        editor.focus();
    };
    const handleEditorChange = (value)=>{
        setJsonInput(value || "");
    };
    const goToError = (line, column)=>{
        if (editorRef.current) {
            editorRef.current.revealLineInCenter(line);
            editorRef.current.setPosition({
                lineNumber: line,
                column: column
            });
            editorRef.current.focus();
        }
    };
    const editorOptions = {
        ...defaultEditorOptions,
        readOnly: false
    };
    const schemaViewerOptions = {
        ...defaultEditorOptions,
        readOnly: true
    };
    return /*#__PURE__*/ jsx(Dialog, {
        open: open,
        onOpenChange: onOpenChange,
        children: /*#__PURE__*/ jsxs(DialogContent, {
            className: "sm:max-w-5xl max-h-[700px] flex flex-col jsonjoy",
            children: [
                /*#__PURE__*/ jsxs(DialogHeader, {
                    children: [
                        /*#__PURE__*/ jsx(DialogTitle, {
                            children: t.validatorTitle
                        }),
                        /*#__PURE__*/ jsx(DialogDescription, {
                            children: t.validatorDescription
                        })
                    ]
                }),
                /*#__PURE__*/ jsxs("div", {
                    className: "flex-1 flex flex-col md:flex-row gap-4 py-4 overflow-hidden h-[600px]",
                    children: [
                        /*#__PURE__*/ jsxs("div", {
                            className: "flex-1 flex flex-col h-full",
                            children: [
                                /*#__PURE__*/ jsx("div", {
                                    className: "text-sm font-medium mb-2",
                                    children: t.validatorContent
                                }),
                                /*#__PURE__*/ jsx("div", {
                                    className: "border rounded-md flex-1 h-full",
                                    children: /*#__PURE__*/ jsx(react, {
                                        height: "600px",
                                        defaultLanguage: "json",
                                        value: jsonInput,
                                        onChange: handleEditorChange,
                                        beforeMount: handleJsonEditorBeforeMount,
                                        onMount: handleEditorDidMount,
                                        loading: /*#__PURE__*/ jsx("div", {
                                            className: "flex items-center justify-center h-full w-full bg-secondary/30",
                                            children: /*#__PURE__*/ jsx(Loader2, {
                                                className: "h-6 w-6 animate-spin"
                                            })
                                        }),
                                        options: editorOptions,
                                        theme: currentTheme
                                    })
                                })
                            ]
                        }),
                        /*#__PURE__*/ jsxs("div", {
                            className: "flex-1 flex flex-col h-full",
                            children: [
                                /*#__PURE__*/ jsx("div", {
                                    className: "text-sm font-medium mb-2",
                                    children: t.validatorCurrentSchema
                                }),
                                /*#__PURE__*/ jsx("div", {
                                    className: "border rounded-md flex-1 h-full",
                                    children: /*#__PURE__*/ jsx(react, {
                                        height: "600px",
                                        defaultLanguage: "json",
                                        value: JSON.stringify(schema, null, 2),
                                        beforeMount: handleSchemaEditorBeforeMount,
                                        loading: /*#__PURE__*/ jsx("div", {
                                            className: "flex items-center justify-center h-full w-full bg-secondary/30",
                                            children: /*#__PURE__*/ jsx(Loader2, {
                                                className: "h-6 w-6 animate-spin"
                                            })
                                        }),
                                        options: schemaViewerOptions,
                                        theme: currentTheme
                                    })
                                })
                            ]
                        })
                    ]
                }),
                validationResult && /*#__PURE__*/ jsxs("div", {
                    className: `rounded-md p-4 ${validationResult.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"} transition-all duration-300 ease-in-out`,
                    children: [
                        /*#__PURE__*/ jsx("div", {
                            className: "flex items-center",
                            children: validationResult.valid ? /*#__PURE__*/ jsxs(Fragment, {
                                children: [
                                    /*#__PURE__*/ jsx(Check, {
                                        className: "h-5 w-5 text-green-500 mr-2"
                                    }),
                                    /*#__PURE__*/ jsx("p", {
                                        className: "text-green-700 font-medium",
                                        children: t.validatorValid
                                    })
                                ]
                            }) : /*#__PURE__*/ jsxs(Fragment, {
                                children: [
                                    /*#__PURE__*/ jsx(AlertCircle, {
                                        className: "h-5 w-5 text-red-500 mr-2"
                                    }),
                                    /*#__PURE__*/ jsx("p", {
                                        className: "text-red-700 font-medium",
                                        children: 1 === validationResult.errors.length ? "/" === validationResult.errors[0].path ? t.validatorErrorInvalidSyntax : t.validatorErrorSchemaValidation : formatTranslation(t.validatorErrorCount, {
                                            count: validationResult.errors.length
                                        })
                                    })
                                ]
                            })
                        }),
                        !validationResult.valid && validationResult.errors && validationResult.errors.length > 0 && /*#__PURE__*/ jsxs("div", {
                            className: "mt-3 max-h-[200px] overflow-y-auto",
                            children: [
                                validationResult.errors[0] && /*#__PURE__*/ jsxs("div", {
                                    className: "flex items-center justify-between mb-2",
                                    children: [
                                        /*#__PURE__*/ jsx("span", {
                                            className: "text-sm font-medium text-red-700",
                                            children: "/" === validationResult.errors[0].path ? t.validatorErrorPathRoot : validationResult.errors[0].path
                                        }),
                                        validationResult.errors[0].line && /*#__PURE__*/ jsx("span", {
                                            className: "text-xs bg-gray-100 px-2 py-1 rounded text-gray-600",
                                            children: validationResult.errors[0].column ? formatTranslation(t.validatorErrorLocationLineAndColumn, {
                                                line: validationResult.errors[0].line,
                                                column: validationResult.errors[0].column
                                            }) : formatTranslation(t.validatorErrorLocationLineOnly, {
                                                line: validationResult.errors[0].line
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ jsx("ul", {
                                    className: "space-y-2",
                                    children: validationResult.errors.map((error, index)=>/*#__PURE__*/ jsx("button", {
                                            type: "button",
                                            className: "w-full text-left bg-white border border-red-100 rounded-md p-3 shadow-xs hover:shadow-md transition-shadow duration-200 cursor-pointer",
                                            onClick: ()=>error.line && error.column && goToError(error.line, error.column),
                                            children: /*#__PURE__*/ jsxs("div", {
                                                className: "flex items-start justify-between",
                                                children: [
                                                    /*#__PURE__*/ jsxs("div", {
                                                        className: "flex-1",
                                                        children: [
                                                            /*#__PURE__*/ jsx("p", {
                                                                className: "text-sm font-medium text-red-700",
                                                                children: "/" === error.path ? t.validatorErrorPathRoot : error.path
                                                            }),
                                                            /*#__PURE__*/ jsx("p", {
                                                                className: "text-sm text-gray-600 mt-1",
                                                                children: error.message
                                                            })
                                                        ]
                                                    }),
                                                    error.line && /*#__PURE__*/ jsx("div", {
                                                        className: "text-xs bg-gray-100 px-2 py-1 rounded text-gray-600",
                                                        children: error.column ? formatTranslation(t.validatorErrorLocationLineAndColumn, {
                                                            line: error.line,
                                                            column: error.column
                                                        }) : formatTranslation(t.validatorErrorLocationLineOnly, {
                                                            line: error.line
                                                        })
                                                    })
                                                ]
                                            })
                                        }, `error-${error.path}-${index}`))
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    });
}
export { JsonValidator };
