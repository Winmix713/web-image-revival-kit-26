import React, { useState } from 'react';
import { InputForm } from '../components/figma/InputForm';
import { CodeDisplay } from '../components/figma/CodeDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { ArrowLeft, AlertCircle, Code2, Zap, FileText, Palette } from 'lucide-react';
import { figmaApi } from '../services/figma-api';
import { codeGenerator } from '../services/code-generator';
import { GeneratedJavaScript, FigmaApiResponse } from '../types/figma';
import { Link } from 'react-router-dom';

export default function FigmaGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<GeneratedJavaScript | null>(null);
  const [figmaData, setFigmaData] = useState<FigmaApiResponse | null>(null);

  const handleGenerate = async (fileKey: string, token: string, nodeId?: string) => {
    setIsLoading(true);
    setError(null);
    setGeneratedCode(null);
    setFigmaData(null);

    try {
      // Validate token first
      const isValidToken = await figmaApi.validateToken(token);
      if (!isValidToken) {
        throw new Error('Invalid Figma token. Please check your token and try again.');
      }

      // Fetch Figma data
      const data = await figmaApi.fetchFigmaFile(fileKey, token, nodeId);
      setFigmaData(data);

      // Generate JavaScript code
      const generated = codeGenerator.generateFromFigmaData(data, fileKey, nodeId);
      setGeneratedCode(generated);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedCode(null);
    setFigmaData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Code2 className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Figma to JavaScript Generator
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert your Figma designs into comprehensive JavaScript code with complete metadata, 
            styling information, and component structure.
          </p>
        </div>

        {/* Features */}
        {!generatedCode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="text-center">
                <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Complete Extraction</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Extracts all metadata, layout properties, styling information, and component hierarchy
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Ready-to-Use Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generates clean, documented JavaScript with helper functions and usage examples
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Palette className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Design Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Includes design tokens, bound variables, and shared styles for design system integration
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {!generatedCode ? (
          <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Generated Code</h2>
              <Button variant="outline" onClick={handleReset}>
                Generate Another
              </Button>
            </div>
            <CodeDisplay generatedCode={generatedCode} figmaData={figmaData} />
          </div>
        )}

        {/* Instructions */}
        {!generatedCode && !isLoading && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Get your Figma Personal Access Token</p>
                  <p className="text-sm">Go to Figma Settings → Personal Access Tokens and create a new token</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Copy your Figma file URL</p>
                  <p className="text-sm">You can paste the URL of an entire file or a specific component</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Generate and download</p>
                  <p className="text-sm">The tool will create a comprehensive JavaScript file with all design data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}