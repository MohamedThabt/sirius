import { detectFormat } from '@/utils/formatConverters';
import { Editor } from '@monaco-editor/react';
import { useRef } from 'react';

interface EditorPanelProps {
    value: string;
    onChange: (value: string) => void;
    onMount?: (editor: any, monaco: any) => void;
    readOnly?: boolean;
}

const EditorPanel = ({ value, onChange, onMount, readOnly = false }: EditorPanelProps) => {
    const format = detectFormat(value);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    const handleEditorChange = (val: string | undefined) => {
        if (!readOnly) {
            onChange(val || '');
        }
    };

    const handleEditorDidMount = (editor: any, monaco: any) => {
        // Configure DBML language highlighting
        monaco.languages.register({ id: 'dbml' });
        monaco.languages.register({ id: 'mermaid' });

        monaco.languages.setMonarchTokensProvider('dbml', {
            tokenizer: {
                root: [
                    [/\/\/.*$/, 'comment'],
                    [/\/\*/, 'comment', '@comment'],
                    [/\b(Table|Ref|Enum|Project|TableGroup|Note)\b/, 'keyword'],
                    [
                        /\b(varchar|integer|int|bigint|text|boolean|datetime|timestamp|date|time|decimal|float|double|json|blob|binary|uuid)\b/i,
                        'type',
                    ],
                    [/\[(pk|primary key|not null|null|unique|increment|default|note|ref)\]/i, 'attribute'],
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/'([^'\\]|\\.)*$/, 'string.invalid'],
                    [/"/, 'string', '@string_double'],
                    [/'/, 'string', '@string_single'],
                    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                    [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                    [/\d+/, 'number'],
                    [/[<>]=?/, 'operator'],
                    [/[=!]=/, 'operator'],
                    [/[-+*/%]/, 'operator'],
                    [/[{}()\[\]]/, '@brackets'],
                    [/[,:;.]/, 'delimiter'],
                ],
                comment: [
                    [/[^\/*]+/, 'comment'],
                    [/\*\//, 'comment', '@pop'],
                    [/[\/*]/, 'comment'],
                ],
                string_double: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape.invalid'],
                    [/"/, 'string', '@pop'],
                ],
                string_single: [
                    [/[^\\']+/, 'string'],
                    [/\\./, 'string.escape.invalid'],
                    [/'/, 'string', '@pop'],
                ],
            },
        });

        editorRef.current = editor;
        monacoRef.current = monaco;

        if (onMount) {
            onMount(editor, monaco);
        }
    };

    return (
        <div className="editor-panel h-full flex-1">
            <div className="h-full w-full">
                <Editor
                    height="100%"
                    defaultLanguage={format}
                    language={format}
                    value={value}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                        lineNumbers: 'on',
                        renderWhitespace: 'selection',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        suggestOnTriggerCharacters: !readOnly,
                        acceptSuggestionOnEnter: readOnly ? 'off' : 'on',
                        snippetSuggestions: readOnly ? 'none' : 'inline',
                        quickSuggestions: !readOnly,
                        readOnly: readOnly,
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPanel;
