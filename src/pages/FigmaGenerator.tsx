import React, { useState } from 'react';
import { InputForm } from '../components/figma/InputForm';
import { CSSInputForm } from '../components/figma/CSSInputForm';
import { CodeDisplay } from '../components/figma/CodeDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, AlertCircle, Code2, Zap, FileText, Palette, Layers } from 'lucide-react';
import { figmaApi } from '../services/figma-api';
import { enhancedCodeGenerator, EnhancedFigmaToJSGenerator } from '../services/enhancedCodeGenerator';
import { GeneratedJavaScript, FigmaApiResponse } from '../types/figma';
import { ParsedCSSData } from '../services/cssParser';
import { Link } from 'react-router-dom';

type GenerationStep = 'input' | 'css' | 'generate' | 'complete';

export default function FigmaGenerator() {
  const [currentStep, setCurrentStep] = useState<GenerationStep>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<GeneratedJavaScript | null>(null);
  const [figmaData, setFigmaData] = useState<FigmaApiResponse | null>(null);
  const [cssData, setCSSData] = useState<ParsedCSSData | null>(null);
  const [figmaParams, setFigmaParams] = useState<{fileKey: string, token: string, nodeId?: string} | null>(null);

  const handleFigmaSubmit = async (fileKey: string, token: string, nodeId?: string) => {
    setIsLoading(true);
    setError(null);
    setFigmaParams({ fileKey, token, nodeId });

    try {
      const isValidToken = await figmaApi.validateToken(token);
      if (!isValidToken) {
        throw new Error('Invalid Figma token. Please check your token and try again.');
      }

      const data = await figmaApi.fetchFigmaFile(fileKey, token, nodeId);
      setFigmaData(data);
      setCurrentStep('css');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSSSubmit = async (cssText: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsedCSS = EnhancedFigmaToJSGenerator.parseCSS(cssText);
      setCSSData(parsedCSS);
      setCurrentStep('generate');
    } catch (err) {
      setError('Failed to parse CSS data. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipCSS = () => {
    setCurrentStep('generate');
  };

  const handleGenerate = async () => {
    if (!figmaData || !figmaParams) return;

    setIsLoading(true);
    setError(null);

    try {
      const generated = enhancedCodeGenerator.generateFromFigmaData({
        figmaData,
        cssData: cssData || undefined,
        fileKey: figmaParams.fileKey,
        nodeId: figmaParams.nodeId
      });
      setGeneratedCode(generated);
      setCurrentStep('complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('input');
    setGeneratedCode(null);
    setFigmaData(null);
    setCSSData(null);
    setFigmaParams(null);
    setError(null);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'input': return 'Figma File Details';
      case 'css': return 'CSS Integration (Optional)';
      case 'generate': return 'Ready to Generate';
      case 'complete': return 'Generated Code';
      default: return 'Generate JavaScript';
    }
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
              Enhanced Figma to JavaScript Generator
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert your Figma designs into comprehensive JavaScript code with optional CSS integration 
            for enhanced accuracy and styling information.
          </p>
        </div>

        {/* Progress indicator */}
        {currentStep !== 'input' && (
          <div className="flex items-center justify-center space-x-4 mb-6">
            {['input', 'css', 'generate', 'complete'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step ? 'bg-blue-600 text-white' : 
                  ['input', 'css', 'generate', 'complete'].indexOf(currentStep) > index ? 'bg-green-600 text-white' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    ['input', 'css', 'generate', 'complete'].indexOf(currentStep) > index ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 text-center">{getStepTitle()}</h2>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        {currentStep === 'input' && (
          <>
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <Layers className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">CSS Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Optional CSS integration from Figma's "Copy as code" for enhanced styling accuracy
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
                  <Palette className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Design Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Includes design tokens, bound variables, and shared styles for design system integration
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <InputForm onGenerate={handleFigmaSubmit} isLoading={isLoading} />
          </>
        )}

        {currentStep === 'css' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Enhance your JavaScript generation with CSS data from Figma for more accurate styling information.
              </p>
            </div>
            
            <Tabs defaultValue="css-input" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="css-input">Add CSS Data</TabsTrigger>
                <TabsTrigger value="skip">Skip CSS Integration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="css-input" className="mt-6">
                <CSSInputForm onCSSSubmit={handleCSSSubmit} isProcessing={isLoading} />
              </TabsContent>
              
              <TabsContent value="skip" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skip CSS Integration</CardTitle>
                    <CardDescription>
                      You can proceed without CSS data. Your JavaScript will still include all Figma metadata and structure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleSkipCSS} className="w-full">
                      Continue Without CSS
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentStep === 'generate' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generation Summary</CardTitle>
                <CardDescription>Review your settings before generating the JavaScript code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Figma File</h4>
                    <p className="text-sm text-gray-600">{figmaData?.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">CSS Integration</h4>
                    <p className="text-sm text-gray-600">
                      {cssData ? `✓ ${cssData.rules.length} CSS rules parsed` : '✗ No CSS data'}
                    </p>
                  </div>
                  {cssData && (
                    <>
                      <div>
                        <h4 className="font-medium text-gray-900">Design Tokens</h4>
                        <p className="text-sm text-gray-600">
                          {cssData.colors.length} colors, {cssData.fonts.length} fonts
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">CSS Features</h4>
                        <p className="text-sm text-gray-600">
                          {cssData.shadows.length} shadows, {cssData.animations.length} animations
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Generating Enhanced JavaScript...
                    </>
                  ) : (
                    'Generate Enhanced JavaScript Code'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'complete' && generatedCode && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Generated Enhanced Code</h2>
              <Button variant="outline" onClick={handleReset}>
                Generate Another
              </Button>
            </div>
            <CodeDisplay generatedCode={generatedCode} figmaData={figmaData} />
          </div>
        )}

        {/* Instructions */}
        {currentStep === 'input' && (
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
                  <p className="font-medium">Optionally add CSS data</p>
                  <p className="text-sm">Use Figma's "Copy as code → CSS" feature for enhanced styling accuracy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <p className="font-medium">Generate and download</p>
                  <p className="text-sm">The tool will create enhanced JavaScript with CSS integration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
