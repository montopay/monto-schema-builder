import type { SchemaType } from "../types/jsonSchema.ts";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper functions for backward compatibility
export const getTypeColor = (type: SchemaType): string => {
  switch (type) {
    case "string":
      return "text-blue-500 bg-blue-50";
    case "number":
    case "integer":
      return "text-purple-500 bg-purple-50";
    case "boolean":
      return "text-green-500 bg-green-50";
    case "object":
      return "text-orange-500 bg-orange-50";
    case "array":
      return "text-pink-500 bg-pink-50";
    case "null":
      return "text-gray-500 bg-gray-50";
  }
};

// Get type display label
export const getTypeLabel = (type: SchemaType): string => {
  switch (type) {
    case "string":
      return "Text";
    case "number":
    case "integer":
      return "Number";
    case "boolean":
      return "Yes/No";
    case "object":
      return "Object";
    case "array":
      return "List";
    case "null":
      return "Empty";
  }
};
