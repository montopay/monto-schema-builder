import type { JSONSchema } from "@/types/jsonSchema";
import { describe, expect, it } from "vitest";
import {
  copySchema,
  createFieldSchema,
  deleteSchemaProperty,
  getChildren,
  getFieldInfo,
  getParentSchema,
  hasChildren,
  isObject,
  setSchemaProperty,
  updateRequiredFields,
} from "./schemaEditor";

describe("schemaEditor", () => {
  describe("copySchema", () => {
    it("should create a deep copy of the schema", () => {
      const original: JSONSchema = {
        type: "object",
        properties: { foo: { type: "string" } },
      };
      const copy = copySchema(original);
      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
    });
  });

  describe("isObject", () => {
    it("should return true for valid object schemas", () => {
      expect(isObject({ type: "object", properties: {} })).toBe(true);
    });

    it("should return false for non-object schemas", () => {
      expect(isObject({ type: "string" })).toBe(false);
      expect(isObject({ type: "array", items: {} })).toBe(false);
    });
  });

  describe("getChildren", () => {
    it("should return empty array for boolean schema", () => {
      expect(getChildren(true)).toEqual([]);
    });

    it("should return object properties as children", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name"],
      };
      const children = getChildren(schema);
      expect(children).toHaveLength(2);
      expect(children[0]).toEqual({
        name: "name",
        schema: { type: "string" },
        required: true,
      });
    });

    it("should return array items as children", () => {
      const schema: JSONSchema = {
        type: "array",
        items: { type: "string" },
      };
      const children = getChildren(schema);
      expect(children).toHaveLength(1);
      expect(children[0]).toEqual({
        name: "items",
        schema: { type: "string" },
        required: false,
      });
    });
  });

  describe("hasChildren", () => {
    it("should return true for objects with properties", () => {
      expect(hasChildren({ type: "object", properties: { foo: {} } })).toBe(
        true,
      );
    });

    it("should return true for arrays with object items", () => {
      expect(
        hasChildren({
          type: "array",
          items: { type: "object", properties: {} },
        }),
      ).toBe(true);
    });

    it("should return false for primitive types", () => {
      expect(hasChildren({ type: "string" })).toBe(false);
    });
  });

  describe("updateRequiredFields", () => {
    it("should add field to required array", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: { foo: { type: "string" } },
      };
      const updated = updateRequiredFields(schema, ["foo"], true);
      expect(typeof updated !== "boolean" && updated.required).toContain("foo");
    });

    it("should remove field from required array", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: { foo: { type: "string" } },
        required: ["foo"],
      };
      const updated = updateRequiredFields(schema, ["foo"], false);
      expect(typeof updated !== "boolean" && updated.required).not.toContain(
        "foo",
      );
    });
  });

  describe("setSchemaProperty", () => {
    it("should set property at given path", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          nested: {
            type: "object",
            properties: {},
          },
        },
      };
      const updated = setSchemaProperty(schema, ["nested", "foo"], {
        type: "string",
      });
      const nestedSchema =
        typeof updated !== "boolean" && updated.properties?.nested;
      expect(
        typeof nestedSchema !== "boolean" && nestedSchema?.properties?.foo,
      ).toEqual({ type: "string" });
    });
  });

  describe("deleteSchemaProperty", () => {
    it("should delete property at given path", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          foo: { type: "string" },
          bar: { type: "number" },
        },
        required: ["foo"],
      };
      const updated = deleteSchemaProperty(schema, ["foo"]);
      expect(
        typeof updated !== "boolean" && updated.properties?.foo,
      ).toBeUndefined();
      expect(typeof updated !== "boolean" && updated.required).not.toContain(
        "foo",
      );
    });
  });

  describe("createFieldSchema", () => {
    it("should create schema from field definition", () => {
      const field = {
        name: "test",
        type: "string" as const,
        description: "A test field",
        validation: { minLength: 3 },
        required: true,
      };
      const schema = createFieldSchema(field);
      expect(schema).toEqual({
        type: "string",
        description: "A test field",
        minLength: 3,
      });
    });
  });

  describe("getFieldInfo", () => {
    it("should return field information for schema", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name"],
      };
      const info = getFieldInfo(schema);
      expect(info).toEqual({
        type: "object",
        properties: [
          {
            name: "name",
            path: ["name"],
            schema: { type: "string" },
            required: true,
          },
          {
            name: "age",
            path: ["age"],
            schema: { type: "number" },
            required: false,
          },
        ],
      });
    });
  });
});
