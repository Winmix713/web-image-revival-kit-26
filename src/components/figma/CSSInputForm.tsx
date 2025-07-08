
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CheckCircle, Code, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface CSSInputFormProps {
  onCSSSubmit: (cssData: string) => void;
  isProcessing?: boolean;
}

export function CSSInputForm({ onCSSSubmit, isProcessing = false }: CSSInputFormProps) {
  const [cssData, setCSSData] = useState('');
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | 'pending'>('pending');
  const [validationMessage, setValidationMessage] = useState('');

  const validateCSS = (css: string) => {
    if (!css.trim()) {
      setValidationStatus('pending');
      setValidationMessage('');
      return;
    }

    // Basic CSS validation
    const hasSelectors = css.includes('{') && css.includes('}');
    const hasProperties = css.includes(':') && css.includes(';');
    const figmaClasses = css.includes('figma') || css.includes('layer') || css.includes('component');

    if (!hasSelectors || !hasProperties) {
      setValidationStatus('invalid');
      setValidationMessage('Invalid CSS format. Please paste CSS code with selectors and properties.');
      return;
    }

    if (figmaClasses) {
      setValidationStatus('valid');
      setValidationMessage('Valid Figma CSS detected! Ready to integrate with your JavaScript code.');
    } else {
      setValidationStatus('valid');
      setValidationMessage('Valid CSS detected. Note: This appears to be generic CSS rather than Figma-generated CSS.');
    }
  };

  const handleCSSChange = (value: string) => {
    setCSSData(value);
    validateCSS(value);
  };

  const handleSubmit = () => {
    if (cssData.trim() && validationStatus === 'valid') {
      onCSSSubmit(cssData);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Import Figma CSS
        </CardTitle>
        <CardDescription>
          Paste the CSS code from Figma's "Copy as code → CSS (all layers)" feature to enhance your JavaScript generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="css-input">CSS Code</Label>
          <Textarea
            id="css-input"
            placeholder="Paste your CSS code here...
Example:
.button {
  background: #3B82F6;
  border-radius: 8px;
  padding: 12px 24px;
}"
            value={cssData}
            onChange={(e) => handleCSSChange(e.target.value)}
            className="min-h-32 font-mono text-sm"
            disabled={isProcessing}
          />
        </div>

        {/* Real-time validation feedback */}
        {validationStatus !== 'pending' && (
          <Alert variant={validationStatus === 'valid' ? 'default' : 'destructive'}>
            {validationStatus === 'valid' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{validationMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {cssData.length > 0 && (
              <span>{cssData.length} characters • {cssData.split('\n').length} lines</span>
            )}
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!cssData.trim() || validationStatus !== 'valid' || isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Use CSS Data
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How to get CSS from Figma:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Select your component or frame in Figma</li>
            <li>Right-click and choose "Copy as code"</li>
            <li>Select "CSS (all layers)" from the options</li>
            <li>Paste the generated CSS code above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
