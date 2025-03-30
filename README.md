# JSON Schema Builder

[![image](https://github.com/user-attachments/assets/6be1cecf-e0d9-4597-ab04-7124e37e332d)](https://json.ophir.dev)

A modern, React-based visual JSON Schema editor for creating and manipulating JSON Schema definitions with an intuitive interface.

**Try online**: https://json.ophir.dev

## Features

- **Visual Schema Editor**: Design your JSON Schema through an intuitive interface without writing raw JSON
- **Real-time JSON Preview**: See your schema in JSON format as you build it visually
- **Schema Inference**: Generate schemas automatically from existing JSON data
- **JSON Validation**: Test JSON data against your schema with detailed validation feedback
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

## Getting Started

### Installation

```bash
git clone https://github.com/lovasoa/jsonjoy-builder.git
cd jsonjoy-builder
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173

### Building for Production

Build the application for production:

```bash
npm run build
```

The built files will be available in the `dist` directory.

## Project Architecture

### Core Components

- **JsonSchemaEditor**: The main component that provides tabs for switching between visual and JSON views
- **SchemaVisualEditor**: Handles the visual representation and editing of schemas
- **JsonSchemaVisualizer**: Provides JSON view with Monaco editor for direct schema editing
- **SchemaInferencer**: Dialog component for generating schemas from JSON data
- **JsonValidator**: Dialog component for validating JSON against the current schema

### Key Features

#### Schema Inference

The application can automatically generate JSON Schema definitions from existing JSON data. This feature uses a recursion-based inference system to detect:

- Object structures and properties
- Array types and their item schemas
- String formats (dates, emails, URIs)
- Numeric types (integers vs. floats)
- Required fields

#### JSON Validation

Validate any JSON document against your schema with:
- Real-time feedback
- Detailed error reporting
- Format validation for emails, dates, and other special formats

## Technology Stack

- **React**: UI framework
- **TypeScript**: Type-safe development
- **Rsbuild**: Build tool and development server
- **ShadCN UI**: Component library
- **Monaco Editor**: Code editor for JSON viewing/editing
- **Ajv**: JSON Schema validation
- **Zod**: Type-safe json parsing in ts
- **Lucide Icons**: Icon library
- **Node.js Test Runner**: Simple built-in testing

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build with development settings |
| `npm run lint` | Run linter |
| `npm run format` | Format code |
| `npm run check` | Type check the project |
| `npm run fix` | Fix linting issues |
| `npm run typecheck` | Type check with TypeScript |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

[@ophir.dev](https://ophir.dev)
