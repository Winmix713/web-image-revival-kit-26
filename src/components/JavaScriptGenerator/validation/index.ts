
import { ValidationResult } from '../types';

export const validateGeneratedCode = async (code: string): Promise<ValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  try {
    // Basic syntax validation
    new Function(code);
  } catch (error) {
    errors.push(`Syntax error: ${error}`);
  }

  // Performance checks
  if (code.length > 100000) {
    warnings.push('Generated code is quite large (>100KB)');
    suggestions.push('Consider using the minimal format or enabling minification');
  }

  // Best practices
  if (!code.includes('export') && !code.includes('module.exports')) {
    warnings.push('No exports found - code may not be importable');
  }

  if (code.includes('eval(') || code.includes('Function(')) {
    errors.push('Potentially unsafe code detected');
  }

  // Structure validation
  if (!code.includes('figma')) {
    warnings.push('Generated code may not contain Figma-specific functionality');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
};
