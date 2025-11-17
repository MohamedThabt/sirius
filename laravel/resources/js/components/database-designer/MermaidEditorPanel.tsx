import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Copy, Download, Sparkles } from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface MermaidEditorPanelProps {
    code: string;
    setCode: (code: string) => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
}

export const MermaidEditorPanel: React.FC<MermaidEditorPanelProps> = ({ code, setCode, prompt, setPrompt, onGenerate }) => {
    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            // Configure Mermaid language support
            if (!monaco.languages.getLanguages().some((lang) => lang.id === 'mermaid')) {
                monaco.languages.register({ id: 'mermaid' });

                monaco.languages.setMonarchTokensProvider('mermaid', {
                    tokenizer: {
                        root: [
                            [/sequenceDiagram/, 'keyword'],
                            [/participant\s+\w+/, 'entity'],
                            [/\w+\s*->>?\s*\w+/, 'arrow'],
                            [/\w+\s*-->>?\s*\w+/, 'return-arrow'],
                            [/:\s*.*$/, 'message'],
                            [/\w+/, 'identifier'],
                        ],
                    },
                });

                monaco.editor.defineTheme('mermaid-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'keyword', foreground: '569cd6' },
                        { token: 'entity', foreground: '4ec9b0' },
                        { token: 'arrow', foreground: 'dcdcaa' },
                        { token: 'return-arrow', foreground: 'c586c0' },
                        { token: 'message', foreground: 'ce9178' },
                        { token: 'identifier', foreground: '9cdcfe' },
                    ],
                    colors: {
                        'editor.background': '#1e1e2e',
                    },
                });
            }
        }
    }, [monaco]);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success('Mermaid code copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy code to clipboard');
        }
    };

    const handleDownloadCode = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sequence-diagram.mmd';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex h-full flex-col bg-background">
            {/* AI Prompt Section */}
            <div className="border-b border-border p-4">
                <Label htmlFor="ai-prompt" className="mb-2 block font-medium text-foreground">
                    AI Prompt
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="ai-prompt"
                        type="text"
                        placeholder="e.g., 'Login flow from user to API' or 'Payment processing sequence'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 border-border bg-background text-foreground placeholder:text-muted-foreground"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onGenerate();
                            }
                        }}
                    />
                    <Button onClick={onGenerate} disabled={!prompt.trim()} className="bg-primary px-4 text-primary-foreground hover:bg-primary/90">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate
                    </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Describe your sequence diagram and click Generate to create Mermaid code</p>
            </div>

            {/* Editor Actions */}
            <div className="flex gap-2 border-b border-border p-4">
                <Button variant="outline" size="sm" onClick={handleCopyCode} className="border-border bg-background text-foreground hover:bg-muted">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCode}
                    className="border-border bg-background text-foreground hover:bg-muted"
                >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
            </div>

            {/* Code Editor */}
            <div className="flex-1 overflow-hidden">
                <Editor
                    height="100%"
                    language="mermaid"
                    theme="mermaid-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        renderWhitespace: 'selection',
                        bracketPairColorization: { enabled: true },
                    }}
                />
            </div>
        </div>
    );
};
