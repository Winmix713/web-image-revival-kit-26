
export interface GenerationOptions {
  format: 'complete' | 'minimal' | 'structured' | 'modular' | 'typescript';
  includeTypes: boolean;
  includeComments: boolean;
  includeValidation: boolean;
  includeHelpers: boolean;
  compressionLevel: 'none' | 'basic' | 'aggressive';
  outputStyle: 'es6' | 'commonjs' | 'umd';
  treeshaking: boolean;
  minify: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ProcessedNode {
  id: string;
  name: string;
  type: string;
  depth: number;
  children?: ProcessedNode[];
  fills?: any[];
  effects?: any[];
  style?: any;
  absoluteBoundingBox?: any;
  constraints?: any;
  characters?: string;
  componentPropertyDefinitions?: any;
}

export interface ComponentStatistics {
  totalNodes: number;
  textNodes: number;
  components: number;
  maxDepth: number;
  nodeTypes: Record<string, number>;
  complexity: 'low' | 'medium' | 'high';
}
