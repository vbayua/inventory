import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableRow, TableCell, TableHeader, TableHead, TableBody } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Shuffle } from 'lucide-react';
import { get } from 'http';

interface Operation {
    id: string;
    created_at: string;
    operation_type: "initial" | "inbound" | "outbound" | "adjustment" | "transfer";
    quantity: number;
    unit: string,
    remarks: string;
    // operator?: string;
}

export default function OperationHistoryTable({ operations }: { operations: Operation[] }) {

    const getOperationIcon = (type: Operation["operation_type"]) => {
        switch (type) {
            case "initial":
                return <ArrowUpCircle className="h-4 w-4 text-accent" />;
            case "inbound":
                return <ArrowUpCircle className="h-4 w-4 text-accent" />;
            case "outbound":
                return <ArrowDownCircle className="h-4 w-4 text-destructive" />;
            case "adjustment":
                return <RefreshCw className="h-4 w-4 text-warning" />;
            case "transfer":
                return <Shuffle className="h-4 w-4 text-primary" />;
        }
    };

    const getOperationBadge = (type: Operation["operation_type"]) => {
        switch (type) {
            case "initial":
                return <Badge className="bg-accent text-accent-foreground">Initial</Badge>;
            case "inbound":
                return <Badge className="bg-accent text-accent-foreground">Inbound</Badge>;
            case "outbound":
                return <Badge variant="destructive">Outbound</Badge>;
            case "adjustment":
                return <Badge className="bg-warning text-warning-foreground">Adjustment</Badge>;
            case "transfer":
                return <Badge className="bg-primary text-primary-foreground">Transfer</Badge>;
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-xl font-semibold text-foreground'>Operation History</CardTitle>
                <CardDescription>List of operations performed on this stock</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">Date & Time</TableHead>
                                <TableHead className="font-semibold">Operation Type</TableHead>
                                <TableHead className="font-semibold">Quantity</TableHead>
                                <TableHead className="font-semibold">Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {operations.map((operation) => (
                                <TableRow key={operation.id} className="hover:bg-accent/10">
                                    <TableCell>
                                        {new Date(operation.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            {getOperationIcon(operation.operation_type)}
                                            {getOperationBadge(operation.operation_type)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={operation.operation_type === "outbound" ? "text-destructive" : "text-foreground"}>
                                            {operation.operation_type === "outbound" ? "-" : "+"}
                                            {operation.quantity}
                                        </span>
                                        {` ${operation.unit}`}
                                    </TableCell>
                                    <TableCell>
                                        {operation.remarks || '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
