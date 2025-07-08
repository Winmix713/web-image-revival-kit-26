import React, { useState, useCallback } from 'react';
import { Download, Copy, Code2, FileText, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { FigmaApiResponse } from '../types/figma';

interface JavaScriptGeneratorProps {
  figmaData: FigmaApiResponse;
  fileKey: string;
}

interface GeneratedCode {
  metaData: any;
  mainComponent: any;
  childrenComponents: any[];
  externalElements: any;
  extractFunction: string;
}

export const JavaScriptGenerator: React.FC<JavaScriptGeneratorProps> = ({ 
  figmaData, 
  fileKey 
}) => {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'complete' | 'minimal' | 'structured'>('complete');

  // Extract Figma styles helper function
  const generateExtractFunction = useCallback(() => {
    return `
// Extract Figma Styles Helper Function
function extractFigmaStyles(figmaData) {
  const styles = {
    name: figmaData.name || 'Unnamed Component',
    nodeID: figmaData.document?.id || 'unknown',
    type: figmaData.document?.type || 'UNKNOWN',
    sourceURL: \`https://www.figma.com/file/${fileKey}?node-id=\${figmaData.document?.id?.replace(':', '-')}\`,
    lastModified: figmaData.lastModified || new Date().toISOString(),
    fileKey: '${fileKey}',
    thumbnailUrl: figmaData.thumbnailUrl || null
  };
  
  return styles;
}`;
  }, [fileKey]);

  // Process Figma data into structured format
  const processComponentData = useCallback((node: any, depth = 0): any => {
    if (!node) return null;

    const processedNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      depth,
      
      // Layout properties
      ...(node.layoutMode && { layoutMode: node.layoutMode }),
      ...(node.itemSpacing !== undefined && { itemSpacing: node.itemSpacing }),
      ...(node.paddingLeft !== undefined && { paddingLeft: node.paddingLeft }),
      ...(node.paddingTop !== undefined && { paddingTop: node.paddingTop }),
      ...(node.paddingRight !== undefined && { paddingRight: node.paddingRight }),
      ...(node.paddingBottom !== undefined && { paddingBottom: node.paddingBottom }),
      
      // Visual properties
      ...(node.fills && { fills: node.fills }),
      ...(node.strokes && { strokes: node.strokes }),
      ...(node.cornerRadius !== undefined && { cornerRadius: node.cornerRadius }),
      ...(node.effects && { effects: node.effects }),
      ...(node.backgroundColor && { backgroundColor: node.backgroundColor }),
      
      // Text properties
      ...(node.characters && { characters: node.characters }),
      ...(node.style && { style: node.style }),
      
      // Component properties
      ...(node.componentPropertyDefinitions && { 
        componentPropertyDefinitions: node.componentPropertyDefinitions 
      }),
      
      // Constraints and positioning
      ...(node.constraints && { constraints: node.constraints }),
      ...(node.absoluteBoundingBox && { absoluteBoundingBox: node.absoluteBoundingBox }),
      ...(node.relativeTransform && { relativeTransform: node.relativeTransform }),
      
      // Children processing
      ...(node.children && { 
        children: node.children.map((child: any) => processComponentData(child, depth + 1))
      })
    };

    return processedNode;
  }, []);

  // Generate complete JavaScript code
  const generateJavaScriptCode = useCallback(() => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const mainComponent = figmaData.document ? processComponentData(figmaData.document) : null;
      
      const codeStructure: GeneratedCode = {
        metaData: {
          fileKey,
          name: figmaData.name,
          lastModified: figmaData.lastModified,
          version: figmaData.version,
          role: figmaData.role,
          editorType: figmaData.editorType,
          thumbnailUrl: figmaData.thumbnailUrl
        },
        mainComponent,
        childrenComponents: mainComponent?.children || [],
        externalElements: {
          components: figmaData.components || {},
          styles: figmaData.styles || {}
        },
        extractFunction: generateExtractFunction()
      };

      let generatedJS = '';

      switch (selectedFormat) {
        case 'complete':
          generatedJS = generateCompleteCode(codeStructure);
          break;
        case 'minimal':
          generatedJS = generateMinimalCode(codeStructure);
          break;
        case 'structured':
          generatedJS = generateStructuredCode(codeStructure);
          break;
      }

      setGeneratedCode(generatedJS);
      setIsGenerating(false);
    }, 1500);
  }, [figmaData, fileKey, selectedFormat, processComponentData, generateExtractFunction]);

  // Generate complete detailed code
  const generateCompleteCode = (structure: GeneratedCode) => {
    return `/**
 * Figma Design JavaScript Export
 * Generated on: ${new Date().toISOString()}
 * File: ${structure.metaData.name}
 * 
 * This file contains the complete digital fingerprint of a Figma component,
 * including all metadata, styling, layout, and structural information
 * necessary for pixel-perfect reproduction in code.
 */

// ===== METADATA AND GENERAL INFORMATION =====
const figmaMetaData = ${JSON.stringify(structure.metaData, null, 2)};

// ===== MAIN COMPONENT STRUCTURE =====
const mainComponentData = ${JSON.stringify(structure.mainComponent, null, 2)};

// ===== EXTERNAL COMPONENTS AND STYLES =====
const externalElements = ${JSON.stringify(structure.externalElements, null, 2)};

// ===== COMPLETE FIGMA DATA =====
const figmaData = {
  metaData: figmaMetaData,
  document: mainComponentData,
  components: externalElements.components,
  styles: externalElements.styles,
  
  // Helper methods
  getComponentById: function(id) {
    return this.components[id] || null;
  },
  
  getStyleById: function(id) {
    return this.styles[id] || null;
  },
  
  getAllTextNodes: function() {
    const textNodes = [];
    const traverse = (node) => {
      if (node.type === 'TEXT') {
        textNodes.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(this.document);
    return textNodes;
  },
  
  getAllComponents: function() {
    const components = [];
    const traverse = (node) => {
      if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
        components.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(this.document);
    return components;
  },
  
  getColorPalette: function() {
    const colors = new Set();
    const traverse = (node) => {
      if (node.fills) {
        node.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b } = fill.color;
            const hex = '#' + [r, g, b].map(x => 
              Math.round(x * 255).toString(16).padStart(2, '0')
            ).join('');
            colors.add(hex);
          }
        });
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(this.document);
    return Array.from(colors);
  }
};

${structure.extractFunction}

// ===== USAGE EXAMPLE =====
/*
// Extract basic information
const basicInfo = extractFigmaStyles(figmaData);
console.log('Component Info:', basicInfo);

// Get all text content
const textNodes = figmaData.getAllTextNodes();
console.log('Text Nodes:', textNodes);

// Get color palette
const colors = figmaData.getColorPalette();
console.log('Color Palette:', colors);

// Access specific component
const mainComponent = figmaData.document;
console.log('Main Component:', mainComponent);
*/

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { figmaData, extractFigmaStyles };
}

// Export for ES6 modules
export { figmaData, extractFigmaStyles };`;
  };

  // Generate minimal code
  const generateMinimalCode = (structure: GeneratedCode) => {
    return `// Minimal Figma Export - ${structure.metaData.name}
const figmaComponent = ${JSON.stringify({
  name: structure.metaData.name,
  id: structure.mainComponent?.id,
  type: structure.mainComponent?.type,
  sourceURL: `https://www.figma.com/file/${fileKey}?node-id=${structure.mainComponent?.id?.replace(':', '-')}`,
  structure: structure.mainComponent
}, null, 2)};

${structure.extractFunction}

export default figmaComponent;`;
  };

  // Generate structured code
  const generateStructuredCode = (structure: GeneratedCode) => {
    return `/**
 * Structured Figma Component Export
 * Component: ${structure.metaData.name}
 */

class FigmaComponent {
  constructor() {
    this.metaData = ${JSON.stringify(structure.metaData, null, 4)};
    this.structure = ${JSON.stringify(structure.mainComponent, null, 4)};
    this.externalElements = ${JSON.stringify(structure.externalElements, null, 4)};
  }

  // Get component metadata
  getMetaData() {
    return this.metaData;
  }

  // Get component structure
  getStructure() {
    return this.structure;
  }

  // Find nodes by type
  findNodesByType(type) {
    const results = [];
    const traverse = (node) => {
      if (node.type === type) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(this.structure);
    return results;
  }

  // Get all fills/colors
  getAllFills() {
    const fills = [];
    const traverse = (node) => {
      if (node.fills) {
        fills.push(...node.fills);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(this.structure);
    return fills;
  }

  // Get component properties
  getComponentProperties() {
    return this.structure.componentPropertyDefinitions || {};
  }

  // Generate CSS from node
  generateCSS(nodeId) {
    const node = this.findNodeById(nodeId);
    if (!node) return null;

    let css = \`/* \${node.name} */
\`;
    
    if (node.fills) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID') {
          const { r, g, b, a = 1 } = fill.color;
          css += \`background-color: rgba(\${Math.round(r*255)}, \${Math.round(g*255)}, \${Math.round(b*255)}, \${a});
\`;
        }
      });
    }

    if (node.cornerRadius) {
      css += \`border-radius: \${node.cornerRadius}px;
\`;
    }

    return css;
  }

  // Find node by ID
  findNodeById(id) {
    const traverse = (node) => {
      if (node.id === id) return node;
      if (node.children) {
        for (const child of node.children) {
          const result = traverse(child);
          if (result) return result;
        }
      }
      return null;
    };
    return traverse(this.structure);
  }
}

${structure.extractFunction}

// Create instance
const figmaComponent = new FigmaComponent();

// Export
export default figmaComponent;
export { FigmaComponent };`;
  };

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [generatedCode]);

  // Download as file
  const downloadFile = useCallback(() => {
    const blob = new Blob([generatedCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `figma-${figmaData.name.toLowerCase().replace(/\s+/g, '-')}.js`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedCode, figmaData.name]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Code2 className="w-12 h-12 mx-auto text-blue-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          JavaScript Code Generator
        </h3>
        <p className="text-gray-600">
          Generate a complete JavaScript file containing the digital fingerprint of your Figma component
        </p>
      </div>

      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Export Format</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedFormat('complete')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedFormat === 'complete'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <h4 className="font-semibold mb-1">Complete Export</h4>
                <p className="text-sm text-gray-600">
                  Full detailed export with all metadata, helper functions, and documentation
                </p>
                <Badge variant="outline" className="mt-2">Recommended</Badge>
              </div>
            </button>

            <button
              onClick={() => setSelectedFormat('minimal')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedFormat === 'minimal'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <h4 className="font-semibold mb-1">Minimal Export</h4>
                <p className="text-sm text-gray-600">
                  Lightweight export with essential data only
                </p>
                <Badge variant="outline" className="mt-2">Compact</Badge>
              </div>
            </button>

            <button
              onClick={() => setSelectedFormat('structured')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedFormat === 'structured'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <h4 className="font-semibold mb-1">Class-based</h4>
                <p className="text-sm text-gray-600">
                  Object-oriented structure with methods and utilities
                </p>
                <Badge variant="outline" className="mt-2">Advanced</Badge>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={generateJavaScriptCode}
          disabled={isGenerating}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generating Code...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate JavaScript Code
            </>
          )}
        </Button>
      </div>

      {/* Generated Code Display */}
      <AnimatePresence>
        {generatedCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Generated JavaScript Code</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className={copySuccess ? 'bg-green-50 border-green-200' : ''}
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadFile}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    value={generatedCode}
                    readOnly
                    className="font-mono text-xs h-96 resize-none bg-gray-50"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">
                      {generatedCode.split('\n').length} lines
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    What's included in this file:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Complete component metadata and file information</li>
                    <li>• Detailed structural hierarchy with all properties</li>
                    <li>• Visual styling data (colors, effects, typography)</li>
                    <li>• Layout and positioning information</li>
                    <li>• Component properties and variants</li>
                    <li>• Helper functions for data extraction</li>
                    <li>• Usage examples and documentation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Panel */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">
                About the Generated JavaScript File
              </h4>
              <p className="text-sm text-purple-800 mb-3">
                This file contains a machine-generated "digital fingerprint" of your Figma component. 
                It includes all the raw JSON data provided by the Figma API, enabling pixel-perfect 
                recreation of the design in code.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-purple-700">
                <div>
                  <strong>Structural Data:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Layer hierarchy and nesting</li>
                    <li>• Element positioning and sizing</li>
                    <li>• Auto-layout rules and constraints</li>
                  </ul>
                </div>
                <div>
                  <strong>Visual Properties:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Colors, gradients, and fills</li>
                    <li>• Typography and text styling</li>
                    <li>• Effects, shadows, and blur</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JavaScriptGenerator;