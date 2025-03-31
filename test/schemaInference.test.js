import assert from "node:assert";
import { test } from "node:test";
import { createSchemaFromJson } from "../dist-test/lib/schema-inference.js";

test("should infer schema for primitive types", () => {
  const json = {
    string: "hello",
    number: 42,
    integer: 42,
    float: 42.5,
    boolean: true,
    null: null,
  };

  const schema = createSchemaFromJson(json);
  assert.strictEqual(schema.properties.string.type, "string");
  assert.strictEqual(schema.properties.number.type, "integer");
  assert.strictEqual(schema.properties.integer.type, "integer");
  assert.strictEqual(schema.properties.float.type, "number");
  assert.strictEqual(schema.properties.boolean.type, "boolean");
  assert.strictEqual(schema.properties.null.type, "null");
});

test("should infer schema for object types", () => {
  const json = {
    person: {
      name: "John",
      age: 30,
    },
  };

  const schema = createSchemaFromJson(json);
  assert.strictEqual(schema.properties.person.type, "object");
  assert.strictEqual(schema.properties.person.properties.name.type, "string");
  assert.strictEqual(schema.properties.person.properties.age.type, "integer");
  assert.deepStrictEqual(schema.properties.person.required, ["name", "age"]);
});

test("should infer schema for array types", () => {
  const json = {
    numbers: [1, 2, 3],
    mixed: [1, "two", true],
    empty: [],
  };

  const schema = createSchemaFromJson(json);
  assert.strictEqual(schema.properties.numbers.type, "array");
  assert.strictEqual(schema.properties.numbers.items.type, "integer");
  assert.strictEqual(schema.properties.mixed.type, "array");
  assert.strictEqual(schema.properties.mixed.items.oneOf.length, 3);
  assert.strictEqual(schema.properties.empty.type, "array");
});

test("should infer schema for array of objects with different properties", () => {
  const json = {
    users: [
      {
        name: "John",
        age: 30,
      },
      {
        name: "Jane",
        address: "123 Main St",
      },
    ],
  };

  const schema = createSchemaFromJson(json);
  assert.strictEqual(schema.$schema, "https://json-schema.org/draft-07/schema");
  assert.strictEqual(schema.properties.users.type, "array");
  assert.strictEqual(schema.properties.users.items.type, "object");
  assert.strictEqual(
    schema.properties.users.items.properties.name.type,
    "string",
  );
  assert.strictEqual(
    schema.properties.users.items.properties.age.type,
    "integer",
  );
  assert.strictEqual(
    schema.properties.users.items.properties.address.type,
    "string",
  );
  // "name" is present in all objects, so it is required;
  // "address" is present in some objects, so it is not required;
  assert.deepStrictEqual(schema.properties.users.items.required, ["name"]);
});

test("should detect string formats", () => {
  const json = {
    date: "2024-03-20",
    datetime: "2024-03-20T12:00:00Z",
    email: "test@example.com",
    uuid: "123e4567-e89b-12d3-a456-426614174000",
    uri: "https://example.com",
  };

  const schema = createSchemaFromJson(json);
  assert.strictEqual(schema.properties.date.format, "date");
  assert.strictEqual(schema.properties.datetime.format, "date-time");
  assert.strictEqual(schema.properties.email.format, "email");
  assert.strictEqual(schema.properties.uuid.format, "uuid");
  assert.strictEqual(schema.properties.uri.format, "uri");
});

test("should handle nested arrays and objects", () => {
  const json = {
    users: [
      {
        name: "John",
        hobbies: ["reading", "gaming"],
      },
      {
        name: "Jane",
        hobbies: ["painting"],
      },
    ],
  };

  const schema = createSchemaFromJson(json);
  assert.strictEqual(schema.properties.users.type, "array");
  assert.strictEqual(schema.properties.users.items.type, "object");
  assert.strictEqual(
    schema.properties.users.items.properties.hobbies.type,
    "array",
  );
  assert.strictEqual(
    schema.properties.users.items.properties.hobbies.items.type,
    "string",
  );
  assert.deepStrictEqual(schema.properties.users.items.required, [
    "name",
    "hobbies",
  ]);
});
