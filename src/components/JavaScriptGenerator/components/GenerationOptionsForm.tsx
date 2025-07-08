
import React from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { GenerationOptions, ComponentStatistics } from '../types';

interface GenerationOptionsFormProps {
  options: GenerationOptions;
  setOptions: React.Dispatch<React.SetStateAction<GenerationOptions>>;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  statistics?: ComponentStatistics | null;
}

export const GenerationOptionsForm: React.FC<GenerationOptionsFormProps> = ({
  options,
  setOptions,
  showAdvanced,
  setShowAdvanced,
  statistics
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Generation Options</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: 'complete', label: 'Complete Export', desc: 'Full-featured with all metadata and helpers', badge: 'Recommended' },
              { key: 'minimal', label: 'Minimal Export', desc: 'Lightweight with essential data only', badge: 'Fast' },
              { key: 'structured', label: 'Class-based', desc: 'Object-oriented with methods', badge: 'OOP' },
              { key: 'modular', label: 'Modular Export', desc: 'Tree-shakable modular structure', badge: 'Modern' },
              { key: 'typescript', label: 'TypeScript', desc: 'Full type safety and IntelliSense', badge: 'Type-safe' }
            ].map((format) => (
              <button
                key={format.key}
                onClick={() => setOptions(prev => ({ ...prev, format: format.key as any }))}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  options.format === format.key
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{format.label}</h4>
                  <Badge variant={format.badge === 'Recommended' ? 'default' : 'secondary'} className="text-xs">
                    {format.badge}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{format.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t pt-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'includeTypes', label: 'Type Definitions' },
                  { key: 'includeComments', label: 'Documentation' },
                  { key: 'includeValidation', label: 'Validation Code' },
                  { key: 'includeHelpers', label: 'Helper Functions' },
                  { key: 'treeshaking', label: 'Tree-shaking' },
                  { key: 'minify', label: 'Minification' }
                ].map((option) => (
                  <label key={option.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options[option.key as keyof GenerationOptions] as boolean}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        [option.key]: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Output Style</label>
                  <select
                    value={options.outputStyle}
                    onChange={(e) => setOptions(prev => ({ ...prev, outputStyle: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="es6">ES6 Modules</option>
                    <option value="commonjs">CommonJS</option>
                    <option value="umd">UMD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compression</label>
                  <select
                    value={options.compressionLevel}
                    onChange={(e) => setOptions(prev => ({ ...prev, compressionLevel: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="basic">Basic</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
              </div>

              {/* Statistics Display */}
              {statistics && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">File Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                    <div>
                      <div className="font-medium">Total Nodes</div>
                      <div>{statistics.totalNodes}</div>
                    </div>
                    <div>
                      <div className="font-medium">Text Nodes</div>
                      <div>{statistics.textNodes}</div>
                    </div>
                    <div>
                      <div className="font-medium">Components</div>
                      <div>{statistics.components}</div>
                    </div>
                    <div>
                      <div className="font-medium">Complexity</div>
                      <div className="capitalize">{statistics.complexity}</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
