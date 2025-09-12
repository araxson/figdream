import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
    ignorePatterns: ['.next/**/*', 'node_modules/**/*', 'build/**/*', 'dist/**/*'],
    rules: {
      // STRICT ENFORCEMENT - ZERO TOLERANCE AS PER RULES.MD
      
      // TypeScript Rules - ALL ERRORS
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_'
      }],
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      
      // React Rules - ALL ERRORS
      'react/display-name': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react/no-unescaped-entities': 'error',
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // TypeScript handles this
      
      // General Rules - ALL ERRORS
      'prefer-const': 'error',
      'import/no-anonymous-default-export': 'error',
      'no-unused-expressions': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    }
  }),
]

export default eslintConfig