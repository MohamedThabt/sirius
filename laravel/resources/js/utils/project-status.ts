import { AlertCircleIcon, CheckCircleIcon, TrendingUpIcon } from 'lucide-react';

export const getCompletionPercentage = (sections: any, features: any[], project: any) => {
    const total = 6;
    let done = 0;
    if (sections?.overview) done++;
    if (sections?.prd) done++;
    if (features.length > 0) done++;
    if (sections?.data_modeling) done++;
    if (project?.c4) done++;
    if (project?.brief) done++;
    return Math.round((done / total) * 100);
};

export const getHealthStatus = (percentage: number) => {
    if (percentage >= 80) return { label: 'excellent', Icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-300' };
    if (percentage >= 60) return { label: 'good', Icon: TrendingUpIcon, color: 'text-blue-600 dark:text-blue-300' };
    if (percentage >= 40) return { label: 'fair', Icon: AlertCircleIcon, color: 'text-orange-600 dark:text-orange-300' };
    return { label: 'needs attention', Icon: AlertCircleIcon, color: 'text-red-600 dark:text-red-300' };
};


