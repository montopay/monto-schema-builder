
import React from 'react';

// Define a generic JSON Schema type that can handle any structure
export type JSONSchemaType = {
  type: string;
  properties?: Record<string, any>;
  items?: JSONSchemaType | Record<string, any>;
  required?: string[];
  description?: string;
  [key: string]: any; // Allow for any additional properties
};

export const exampleSchema: JSONSchemaType = {
  type: 'object',
  properties: {
    person: {
      type: 'object',
      description: 'Personal information',
      properties: {
        firstName: {
          type: 'string',
          description: 'First name of the person'
        },
        lastName: {
          type: 'string',
          description: 'Last name of the person'
        },
        age: {
          type: 'number',
          description: 'Age in years'
        },
        isEmployed: {
          type: 'boolean',
          description: 'Whether the person is currently employed'
        }
      },
      required: ['firstName', 'lastName']
    },
    address: {
      type: 'object',
      description: 'Address information',
      properties: {
        street: {
          type: 'string',
          description: 'Street address'
        },
        city: {
          type: 'string',
          description: 'City name'
        },
        zipCode: {
          type: 'string',
          description: 'Postal/ZIP code'
        }
      }
    },
    hobbies: {
      type: 'array',
      description: 'List of hobbies',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the hobby'
          },
          yearsExperience: {
            type: 'number',
            description: 'Years of experience'
          }
        }
      }
    }
  },
  required: ['person']
};

const SchemaExample: React.FC = () => {
  return null; // This component just exports the example schema
};

export default SchemaExample;
