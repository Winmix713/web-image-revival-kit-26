
import { FigmaApiResponse } from '../../../types/figma';
import { ProcessedNode, ComponentStatistics } from '../types';

export const processNodeStructure = (figmaData: FigmaApiResponse, fileKey: string) => {
  const processNode = (node: any, depth = 0): ProcessedNode => {
    return {
      id: node.id || `node-${Math.random().toString(36).substr(2, 9)}`,
      name: node.name || 'Unnamed',
      type: node.type || 'UNKNOWN',
      depth,
      ...(node.children && { children: node.children.map((child: any) => processNode(child, depth + 1)) }),
      ...(node.fills && { fills: node.fills }),
      ...(node.effects && { effects: node.effects }),
      ...(node.style && { style: node.style }),
      ...(node.absoluteBoundingBox && { absoluteBoundingBox: node.absoluteBoundingBox }),
      ...(node.constraints && { constraints: node.constraints }),
      ...(node.characters && { characters: node.characters }),
      ...(node.componentPropertyDefinitions && { componentPropertyDefinitions: node.componentPropertyDefinitions })
    };
  };

  return {
    metaData: {
      name: figmaData.name,
      fileKey,
      lastModified: figmaData.lastModified,
      version: figmaData.version,
      role: figmaData.role,
      editorType: figmaData.editorType,
      thumbnailUrl: figmaData.thumbnailUrl
    },
    processedDocument: processNode(figmaData.document),
    components: figmaData.components || {},
    styles: figmaData.styles || {}
  };
};

export const calculateStatistics = (node: ProcessedNode): ComponentStatistics => {
  let nodeCount = 0;
  let textNodeCount = 0;
  let componentCount = 0;
  let maxDepth = 0;
  const nodeTypes: Record<string, number> = {};

  const traverse = (currentNode: ProcessedNode) => {
    nodeCount++;
    maxDepth = Math.max(maxDepth, currentNode.depth);
    nodeTypes[currentNode.type] = (nodeTypes[currentNode.type] || 0) + 1;
    
    if (currentNode.type === 'TEXT') textNodeCount++;
    if (currentNode.type === 'COMPONENT' || currentNode.type === 'INSTANCE') componentCount++;
    
    if (currentNode.children) {
      currentNode.children.forEach(traverse);
    }
  };

  traverse(node);

  return {
    totalNodes: nodeCount,
    textNodes: textNodeCount,
    components: componentCount,
    maxDepth,
    nodeTypes,
    complexity: nodeCount < 20 ? 'low' : nodeCount < 50 ? 'medium' : 'high'
  };
};
