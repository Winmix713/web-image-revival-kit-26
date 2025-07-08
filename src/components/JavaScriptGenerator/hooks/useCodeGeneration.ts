
import { useState, useCallback, useMemo } from 'react';
import { FigmaApiResponse } from '../../../types/figma';
import { GenerationOptions, ValidationResult, ProcessedNode, ComponentStatistics } from '../types';
import { generateCompleteCode, generateMinimalCode, generateStructuredCode, generateModularCode, generateTypeScriptCode } from '../generators';
import { validateGeneratedCode } from '../validation';
import { processNodeStructure, calculateStatistics } from '../utils';

export const useCodeGeneration = (figmaData: FigmaApiResponse, fileKey: string) => {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Process Figma data into structured format
  const processedData = useMemo(() => {
    if (!figmaData?.document) return null;
    return processNodeStructure(figmaData, fileKey);
  }, [figmaData, fileKey]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!processedData?.processedDocument) return null;
    return calculateStatistics(processedData.processedDocument);
  }, [processedData]);

  // Main code generation function
  const generateAdvancedCode = useCallback(async (options: GenerationOptions) => {
    if (!processedData) {
      setValidationResult({
        isValid: false,
        errors: ['No processed data available'],
        warnings: [],
        suggestions: ['Please ensure Figma data is loaded correctly']
      });
      return;
    }

    setIsGenerating(true);
    setValidationResult(null);

    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      let code = '';
      switch (options.format) {
        case 'complete':
          code = generateCompleteCode(processedData, options);
          break;
        case 'minimal':
          code = generateMinimalCode(processedData, options);
          break;
        case 'structured':
          code = generateStructuredCode(processedData, options);
          break;
        case 'modular':
          code = generateModularCode(processedData, options);
          break;
        case 'typescript':
          code = generateTypeScriptCode(processedData, options);
          break;
      }

      // Post-process code
      if (options.minify) {
        code = code
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\/\/.*$/gm, '') // Remove single line comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .trim();
      }

      setGeneratedCode(code);
      
      // Validate generated code
      const validation = await validateGeneratedCode(code);
      setValidationResult(validation);

    } catch (error) {
      console.error('Code generation failed:', error);
      setValidationResult({
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        suggestions: ['Try a different format', 'Check your Figma data structure']
      });
    } finally {
      setIsGenerating(false);
    }
  }, [processedData]);

  return {
    generatedCode,
    isGenerating,
    validationResult,
    processedData,
    statistics,
    generateAdvancedCode
  };
};
