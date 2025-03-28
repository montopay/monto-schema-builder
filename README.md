# JSON Builder Project

This is a JSON builder project that helps you create and manipulate JSON data structures with a user-friendly interface.

## Development

### Local Development

To work locally using your own IDE:

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```

### Building for Production

To build the project for production:

```bash
npm run build
```

### Deployment

To deploy your project:

1. Build the project
2. Deploy the contents of the `dist` directory to your hosting provider

### Custom Domains

For information about setting up custom domains, please refer to your hosting provider's documentation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# JSON Schema Editor

A component-based editor for creating and modifying JSON Schema objects.

## Architecture

The editor follows a component-based architecture where each component is responsible for managing its own piece of the schema. This approach provides several advantages:

1. **Encapsulation**: Each component manages its own schema fragment
2. **Locality**: Schema updates happen locally, not through a central manager
3. **Composability**: Components can be easily composed to create complex schemas
4. **Reusability**: Schema editing logic is contained within the components

### Core Components

#### `JsonSchemaEditor`
- The root component that manages the overall schema
- Provides tabs for switching between visual and JSON editing modes
- Maintains the schema state and passes it to child components

#### `SchemaField` Factory Component
- Acts as a factory that renders the appropriate field type based on the schema type
- Routes rendering to the specialized field components: `ObjectSchemaField`, `ArraySchemaField`, or `PrimitiveSchemaField`

#### Type-Specific Field Components
- **`ObjectSchemaField`**: Manages object-type schemas, handling properties and required fields
- **`ArraySchemaField`**: Manages array-type schemas and their items schema
- **`PrimitiveSchemaField`**: Manages primitive type schemas (string, number, boolean)

#### Supporting Components
- `SchemaFieldList`: Renders a list of schema fields for an object
- `FieldDisplay`: Renders the UI for editing field properties (name, type, description, required)
- `AddFieldButton`: Button for adding new fields to a schema

### Schema Update Flow

1. Each component manages updates to its own schema fragment
2. When a change occurs, the component creates a new schema with the updates
3. The component then calls its `onEdit` callback with the updated schema
4. Changes propagate up the component tree until reaching the root `JsonSchemaEditor`
5. The root component updates its state and triggers a re-render

### Utility Functions

The architecture relies on pure utility functions for schema manipulation:

- `updateObjectProperty`: Adds or updates a property in an object schema
- `removeObjectProperty`: Removes a property from an object schema
- `updatePropertyRequired`: Updates the 'required' status of a property
- `updateArrayItems`: Updates an array schema's items
- `getSchemaProperties`: Gets properties from an object schema
- `getArrayItemsSchema`: Gets the items schema from an array schema

## Usage

```jsx
import { JsonSchemaEditor } from './components/SchemaEditor';

function App() {
  const [schema, setSchema] = useState({ type: 'object', properties: {} });
  
  return (
    <JsonSchemaEditor
      initialSchema={schema}
      onChange={setSchema}
    />
  );
}
```
