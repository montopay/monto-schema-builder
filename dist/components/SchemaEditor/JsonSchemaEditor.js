import { jsx, jsxs } from "react/jsx-runtime";
import { Maximize2 } from "lucide-react";
import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.js";
import { cn } from "../../lib/utils.js";
import JsonSchemaVisualizer from "./JsonSchemaVisualizer.js";
import SchemaVisualEditor from "./SchemaVisualEditor.js";
import { useTranslation } from "../../hooks/use-translation.js";
const JsonSchemaEditor = ({ schema = {
    type: "object"
}, setSchema, className })=>{
    const handleSchemaChange = (newSchema)=>{
        setSchema(newSchema);
    };
    const t = useTranslation();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [leftPanelWidth, setLeftPanelWidth] = useState(50);
    const resizeRef = useRef(null);
    const containerRef = useRef(null);
    const isDraggingRef = useRef(false);
    const toggleFullscreen = ()=>{
        setIsFullscreen(!isFullscreen);
    };
    const fullscreenClass = isFullscreen ? "fixed inset-0 z-50 bg-background" : "";
    const handleMouseDown = (e)=>{
        e.preventDefault();
        isDraggingRef.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };
    const handleMouseMove = (e)=>{
        if (!isDraggingRef.current || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = (e.clientX - containerRect.left) / containerRect.width * 100;
        if (newWidth >= 20 && newWidth <= 80) setLeftPanelWidth(newWidth);
    };
    const handleMouseUp = ()=>{
        isDraggingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };
    return /*#__PURE__*/ jsxs("div", {
        className: cn("json-editor-container w-full", fullscreenClass, className, "jsonjoy"),
        children: [
            /*#__PURE__*/ jsx("div", {
                className: "block lg:hidden w-full",
                children: /*#__PURE__*/ jsxs(Tabs, {
                    defaultValue: "visual",
                    className: "w-full",
                    children: [
                        /*#__PURE__*/ jsxs("div", {
                            className: "flex items-center justify-between px-4 py-3 border-b w-full",
                            children: [
                                /*#__PURE__*/ jsx("h3", {
                                    className: "font-medium",
                                    children: t.schemaEditorTitle
                                }),
                                /*#__PURE__*/ jsxs("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ jsx("button", {
                                            type: "button",
                                            onClick: toggleFullscreen,
                                            className: "p-1.5 rounded-md hover:bg-secondary transition-colors",
                                            "aria-label": "Toggle fullscreen",
                                            children: /*#__PURE__*/ jsx(Maximize2, {
                                                size: 16
                                            })
                                        }),
                                        /*#__PURE__*/ jsxs(TabsList, {
                                            className: "grid grid-cols-2 w-[200px]",
                                            children: [
                                                /*#__PURE__*/ jsx(TabsTrigger, {
                                                    value: "visual",
                                                    children: t.schemaEditorEditModeVisual
                                                }),
                                                /*#__PURE__*/ jsx(TabsTrigger, {
                                                    value: "json",
                                                    children: t.schemaEditorEditModeJson
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ jsx(TabsContent, {
                            value: "visual",
                            className: cn("focus:outline-hidden w-full", isFullscreen ? "h-screen" : "h-[500px]"),
                            children: /*#__PURE__*/ jsx(SchemaVisualEditor, {
                                schema: schema,
                                onChange: handleSchemaChange
                            })
                        }),
                        /*#__PURE__*/ jsx(TabsContent, {
                            value: "json",
                            className: cn("focus:outline-hidden w-full", isFullscreen ? "h-screen" : "h-[500px]"),
                            children: /*#__PURE__*/ jsx(JsonSchemaVisualizer, {
                                schema: schema,
                                onChange: handleSchemaChange
                            })
                        })
                    ]
                })
            }),
            /*#__PURE__*/ jsxs("div", {
                ref: containerRef,
                className: cn("hidden lg:flex lg:flex-col w-full", isFullscreen ? "h-screen" : "h-[600px]"),
                children: [
                    /*#__PURE__*/ jsxs("div", {
                        className: "flex items-center justify-between px-4 py-3 border-b w-full shrink-0",
                        children: [
                            /*#__PURE__*/ jsx("h3", {
                                className: "font-medium",
                                children: t.schemaEditorTitle
                            }),
                            /*#__PURE__*/ jsx("button", {
                                type: "button",
                                onClick: toggleFullscreen,
                                className: "p-1.5 rounded-md hover:bg-secondary transition-colors",
                                "aria-label": t.schemaEditorToggleFullscreen,
                                children: /*#__PURE__*/ jsx(Maximize2, {
                                    size: 16
                                })
                            })
                        ]
                    }),
                    /*#__PURE__*/ jsxs("div", {
                        className: "flex flex-row w-full grow min-h-0",
                        children: [
                            /*#__PURE__*/ jsx("div", {
                                className: "h-full min-h-0",
                                style: {
                                    width: `${leftPanelWidth}%`
                                },
                                children: /*#__PURE__*/ jsx(SchemaVisualEditor, {
                                    schema: schema,
                                    onChange: handleSchemaChange
                                })
                            }),
                            /*#__PURE__*/ jsx("div", {
                                ref: resizeRef,
                                className: "w-1 bg-border hover:bg-primary cursor-col-resize shrink-0",
                                onMouseDown: handleMouseDown
                            }),
                            /*#__PURE__*/ jsx("div", {
                                className: "h-full min-h-0",
                                style: {
                                    width: `${100 - leftPanelWidth}%`
                                },
                                children: /*#__PURE__*/ jsx(JsonSchemaVisualizer, {
                                    schema: schema,
                                    onChange: handleSchemaChange
                                })
                            })
                        ]
                    })
                ]
            })
        ]
    });
};
const SchemaEditor_JsonSchemaEditor = JsonSchemaEditor;
export { SchemaEditor_JsonSchemaEditor as default };
