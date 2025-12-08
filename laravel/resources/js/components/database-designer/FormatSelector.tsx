import { Badge } from '@/components/ui/badge';
import { detectFormat } from '@/utils/formatConverters';

interface FormatSelectorProps {
    content: string;
}

const FormatSelector = ({ content }: FormatSelectorProps) => {
    const currentFormat = detectFormat(content);

    return (
        <div className="flex items-center bg-muted/20 px-4 py-2">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Format:</span>
                <Badge variant="secondary" className="uppercase font-mono text-xs">
                    {currentFormat}
                </Badge>
            </div>
        </div>
    );
};

export default FormatSelector;
