import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Placeholder for a chart card while its deferred data loads.
 * Keeps the real title so the layout does not shift when the chart arrives.
 */
export default function ChartCardSkeleton({ title, description }: { title: string; description: string }) {
    return (
        <Card aria-busy="true">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[250px] w-full" />
                <span className="sr-only">Loading {title.toLowerCase()}…</span>
            </CardContent>
        </Card>
    );
}
