import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { detectFormat } from '@/utils/formatConverters';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';

interface FormatSelectorProps {
    content: string;
    onConvert: () => void;
    isConverting: boolean;
}

const FormatSelector = ({ content, onConvert, isConverting }: FormatSelectorProps) => {
    const currentFormat = detectFormat(content);
    const targetFormat = currentFormat === 'dbml' ? 'mermaid' : 'dbml';

    return (
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">Format:</span>
                <Badge variant="secondary" className="uppercase">
                    {currentFormat}
                </Badge>
            </div>

            <Button variant="outline" size="sm" onClick={onConvert} disabled={isConverting} className="flex items-center space-x-2">
                {isConverting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
                <span>Convert to {targetFormat.toUpperCase()}</span>
            </Button>
        </div>
    );
};

export default FormatSelector;
