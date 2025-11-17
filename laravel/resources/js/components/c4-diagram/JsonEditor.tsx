import { Card } from '@/components/ui/card';
import Editor from '@monaco-editor/react';
import { useRef } from 'react';

interface JsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const JsonEditor = ({ value, onChange, error }: JsonEditorProps) => {
    const editorRef = useRef<unknown>(null);

    const handleEditorDidMount = (editor: unknown) => {
        editorRef.current = editor;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (editor as any).updateOptions({
            theme: 'vs-dark',
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
        });
    };

    const handleEditorChange = (newValue: string | undefined) => {
        if (newValue !== undefined) {
            onChange(newValue);
        }
    };

    return (
        <Card className="shadow-elegant flex h-full flex-col border-border bg-card">
            <div className="min-h-0 flex-1">
                <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={value}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    options={{
                        theme: 'vs-dark',
                        fontSize: 14,
                        lineNumbers: 'on',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                        formatOnPaste: true,
                        formatOnType: true,
                    }}
                />
            </div>

            {error && (
                <div className="border-t border-border bg-destructive/10 p-4">
                    <div className="flex items-start space-x-2">
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-destructive"></div>
                        <div>
                            <p className="text-sm font-medium text-destructive">JSON Validation Error</p>
                            <p className="mt-1 font-mono text-xs text-destructive/80">{error}</p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default JsonEditor;
