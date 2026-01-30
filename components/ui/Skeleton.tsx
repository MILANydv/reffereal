'use client';


interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 dark:bg-slate-800 ${className || ''}`}
            {...props}
        />
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-16" />
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    );
}

export function PageHeaderSkeleton() {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-slate-900/50">
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {Array.from({ length: rows }).map((_, ri) => (
                            <tr key={ri}>
                                {Array.from({ length: cols }).map((_, ci) => (
                                    <td key={ci} className="px-6 py-4">
                                        <Skeleton className="h-4 w-full" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
