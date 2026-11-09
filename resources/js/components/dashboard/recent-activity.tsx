import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Shuffle } from 'lucide-react';
import { formatQuantity, type RecentOperation } from './types';

const operationLabels: Record<RecentOperation['operation_type'], string> = {
    initial: 'Initial',
    inbound: 'Inbound',
    outbound: 'Outbound',
    transfer: 'Transfer',
    adjustment: 'Adjustment',
};

function OperationIcon({ type }: { type: RecentOperation['operation_type'] }) {
    const className = 'text-muted-foreground size-4 shrink-0';

    switch (type) {
        case 'initial':
        case 'inbound':
            return <ArrowUpCircle className={className} />;
        case 'outbound':
            return <ArrowDownCircle className={className} />;
        case 'transfer':
            return <Shuffle className={className} />;
        default:
            return <RefreshCw className={className} />;
    }
}

export default function RecentActivity({ operations }: { operations: RecentOperation[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Latest stock operations</CardDescription>
            </CardHeader>
            <CardContent>
                {operations.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">No operations recorded yet.</p>
                ) : (
                    <ul className="divide-y">
                        {operations.map((operation) => (
                            <li key={operation.id}>
                                <Link
                                    href={route('operations.show', operation.id)}
                                    className="hover:bg-muted/50 -mx-2 flex items-start gap-3 rounded-md px-2 py-3"
                                >
                                    <OperationIcon type={operation.operation_type} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-medium">{operation.product ?? '—'}</p>
                                            <span className="shrink-0 text-sm tabular-nums">
                                                {formatQuantity(operation.quantity)} {operation.unit}
                                            </span>
                                        </div>
                                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                            <Badge variant="outline" size="sm">
                                                {operationLabels[operation.operation_type] ?? operation.operation_type}
                                            </Badge>
                                            <span>{operation.location ?? '—'}</span>
                                            <span>·</span>
                                            <span>{operation.user ?? 'System'}</span>
                                            <span>·</span>
                                            <time dateTime={operation.operation_date}>
                                                {formatDistanceToNow(parseISO(operation.operation_date), { addSuffix: true })}
                                            </time>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
