// components/InfoTooltip.tsx
import React from 'react';
import { Info } from 'lucide-react'; // You can swap this with any icon lib you like
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface InfoTooltipProps {
    message: string;
    size?: number;
    className?: string;
    variant?: string
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ message, variant, size = 16, className = "" }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className={`cursor-pointer text-muted-foreground ${className}`}>
                        <Info size={size} className={`${variant === "ink" ? "text-inkBlueTwo bg-paleLightBlue" : "text-textBlack bg-[#F6F8FA]"}`} />
                    </span>
                </TooltipTrigger>
                <TooltipContent className={`max-w-xs text-sm p-2  border border-primary rounded-md shadow ${variant === "ink" ? "text-inkBlueTwo bg-paleLightBlue" : "text-textBlack bg-[#F6F8FA]"}`}>
                    {message}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default InfoTooltip;
