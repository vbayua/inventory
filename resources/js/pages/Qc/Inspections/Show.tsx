import ContainerLayout from '@/components/container-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { QcChecklist, QcInspection } from '@/types/resources';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, CalendarIcon, CheckCircle2, ClipboardCheck, Link2Icon, MapPin, Package, User, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Quality Control', href: '/qc/inspections' },
    { title: 'Inspections', href: '/qc/inspections' },
    { title: 'Detail', href: '' },
];

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
    checking: { label: 'Checking', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
    pass: { label: 'Pass', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    reject: { label: 'Reject', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
};

const resultConfig: Record<string, { label: string; className: string }> = {
    pass: { label: 'Pass', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    fail: { label: 'Fail', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    na: { label: 'N/A', className: 'bg-gray-100 text-gray-600 hover:bg-gray-100' },
};

type ItemResult = {
    qc_checklist_item_id?: number;
    item_name: string;
    result: 'pass' | 'fail' | 'na' | '';
    notes: string;
};

type OverallResult = 'pass' | 'reject' | '';

interface Props {
    inspection: QcInspection;
    availableChecklists: QcChecklist[];
}

export default function Show({ inspection, availableChecklists }: Props) {
    breadcrumbs[2].href = `/qc/inspections/${inspection.id}`;
    console.log(availableChecklists);
    const product = inspection.receive_order_item?.product ?? inspection.receive_order_item?.purchase_order_item?.product;

    const statusCfg = statusConfig[inspection.status] ?? {
        label: inspection.status,
        className: 'bg-gray-100 text-gray-700',
    };

    // ── Start Inspection state ──────────────────────────────────────────────
    const [startChecklistId, setStartChecklistId] = useState<string>('');
    const [startNotes, setStartNotes] = useState('');
    const [startProcessing, setStartProcessing] = useState(false);

    const handleStart = () => {
        setStartProcessing(true);
        router.post(
            route('qc.inspections.start', inspection.id),
            {
                qc_checklist_id: startChecklistId || null,
                notes: startNotes || null,
            },
            {
                onSuccess: () => {},
                onError: () => {
                    toast.error('Failed to start inspection.');
                    setStartProcessing(false);
                },
                onFinish: () => setStartProcessing(false),
            },
        );
    };

    // ── Submit Inspection state ─────────────────────────────────────────────
    const buildInitialItems = useCallback((): ItemResult[] => {
        if (inspection.checklist?.items && inspection.checklist.items.length > 0) {
            return inspection.checklist.items.map((ci) => ({
                qc_checklist_item_id: ci.id,
                item_name: ci.item_name,
                result: '',
                notes: '',
            }));
        }
        // Freeform — start with one blank row
        return [{ item_name: '', result: '', notes: '' }];
    }, [inspection.checklist]);

    const [items, setItems] = useState<ItemResult[]>(buildInitialItems);
    const [overallResult, setOverallResult] = useState<OverallResult>('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitNotes, setSubmitNotes] = useState('');
    const [submitProcessing, setSubmitProcessing] = useState(false);

    useEffect(() => {
        setItems(buildInitialItems());
    }, [inspection.checklist, buildInitialItems]);

    const setItemField = <K extends keyof ItemResult>(index: number, field: K, value: ItemResult[K]) => {
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    };

    const addFreeformItem = () => {
        setItems((prev) => [...prev, { item_name: '', result: '', notes: '' }]);
    };

    const removeFreeformItem = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const isChecklist = !!(inspection.checklist?.items && inspection.checklist.items.length > 0);

    const handleSubmit = () => {
        if (!overallResult) {
            toast.error('Select an overall result (Pass or Reject).');
            return;
        }
        if (overallResult === 'reject' && !rejectionReason.trim()) {
            toast.error('Rejection reason is required.');
            return;
        }
        const unfinished = items.filter((i) => i.result === '' && i.item_name.trim() !== '');
        if (unfinished.length > 0) {
            toast.error('All checklist items must have a result selected.');
            return;
        }

        setSubmitProcessing(true);
        router.post(
            route('qc.inspections.submit', inspection.id),
            {
                overall_result: overallResult,
                rejection_reason: overallResult === 'reject' ? rejectionReason : null,
                notes: submitNotes || null,
                results: items
                    .filter((i) => i.item_name.trim() !== '')
                    .map((i) => ({
                        qc_checklist_item_id: i.qc_checklist_item_id ?? null,
                        item_name: i.item_name,
                        result: i.result || 'na',
                        notes: i.notes || null,
                    })),
            },
            {
                onSuccess: () => {},
                onError: () => {
                    toast.error('Failed to submit inspection.');
                    setSubmitProcessing(false);
                },
                onFinish: () => setSubmitProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`QC Inspection #${inspection.id}`} />
            <ContainerLayout>
                <div className="space-y-6">
                    {/* Back */}
                    <div>
                        <Button variant="link" asChild className="px-0">
                            <Link href={route('qc.inspections.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Inspections
                            </Link>
                        </Button>
                    </div>

                    {/* ── Inspection Details ── */}
                    <Card>
                        <CardHeader className="flex flex-col justify-between md:flex-row md:items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <ClipboardCheck className="h-5 w-5" />
                                    Inspection #{inspection.id}
                                </CardTitle>
                                <CardDescription className="mt-1">Quality control inspection record.</CardDescription>
                            </div>
                            <div className="mt-3 md:mt-0">
                                <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Receive Order */}
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Receive Order</p>
                                    {inspection.receive_order ? (
                                        <Link
                                            href={route('receive-orders.show', inspection.receive_order_id)}
                                            className="mt-1 flex items-center gap-1 text-sm hover:underline"
                                        >
                                            {inspection.receive_order.receive_number}
                                            <Link2Icon className="h-3 w-3" />
                                        </Link>
                                    ) : (
                                        <p className="mt-1 text-sm">#{inspection.receive_order_id}</p>
                                    )}
                                </div>

                                {/* Product */}
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <Package className="h-3.5 w-3.5" />
                                        Product
                                    </p>
                                    <p className="mt-1 text-sm font-medium">{product?.name ?? '-'}</p>
                                    {product?.sku && <p className="text-muted-foreground text-xs">{product.sku}</p>}
                                </div>

                                {/* Qty */}
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Qty Received</p>
                                    <p className="mt-1 text-sm">
                                        {inspection.receive_order_item?.quantity_received ?? '-'} {product?.unit ?? ''}
                                    </p>
                                </div>

                                {/* Location */}
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Location
                                    </p>
                                    <p className="mt-1 text-sm">{inspection.receive_order_item?.location?.name ?? '-'}</p>
                                </div>

                                {/* Inspector */}
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <User className="h-3.5 w-3.5" />
                                        Inspector
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {inspection.inspector?.name ?? <span className="text-muted-foreground italic">Unassigned</span>}
                                    </p>
                                </div>

                                {/* Inspection Date */}
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <CalendarIcon className="h-3.5 w-3.5" />
                                        Inspection Date
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {inspection.inspection_date ? format(new Date(inspection.inspection_date), 'LLL dd, yyyy') : '-'}
                                    </p>
                                </div>

                                {/* Checklist */}
                                {inspection.checklist && (
                                    <div>
                                        <p className="text-muted-foreground text-sm font-medium">Checklist</p>
                                        <p className="mt-1 text-sm">{inspection.checklist.name}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── PENDING: Start Inspection ── */}
                    {inspection.status === 'pending' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Start Inspection</CardTitle>
                                <CardDescription>Assign a checklist (optional) and begin the QC process.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="start_checklist">Checklist (optional)</Label>
                                    <Select value={startChecklistId} onValueChange={(v) => setStartChecklistId(v === '__none__' ? '' : v)}>
                                        <SelectTrigger id="start_checklist">
                                            <SelectValue placeholder="No checklist (freeform)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">No checklist (freeform)</SelectItem>
                                            {availableChecklists.map((cl) => (
                                                <SelectItem key={cl.id} value={String(cl.id)}>
                                                    {cl.name}
                                                    {cl.product_type && (
                                                        <span className="text-muted-foreground ml-1 text-xs">({cl.product_type.name})</span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="start_notes">Notes (optional)</Label>
                                    <Textarea
                                        id="start_notes"
                                        value={startNotes}
                                        onChange={(e) => setStartNotes(e.target.value)}
                                        placeholder="Any notes before starting..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleStart} disabled={startProcessing}>
                                        {startProcessing ? 'Starting...' : 'Start Inspection'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── CHECKING: Submit Form ── */}
                    {inspection.status === 'checking' && (
                        <div className="space-y-6">
                            {/* Checklist Items */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{isChecklist ? inspection.checklist?.name : 'Inspection Items'}</CardTitle>
                                            <CardDescription>
                                                {isChecklist ? 'Rate each checklist item below.' : 'Add items to inspect and rate them.'}
                                            </CardDescription>
                                        </div>
                                        {!isChecklist && (
                                            <Button type="button" variant="outline" size="sm" onClick={addFreeformItem}>
                                                + Add Item
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={index} className="bg-muted/30 rounded-lg border p-4">
                                            <div className="mb-3 flex items-start justify-between gap-4">
                                                {isChecklist ? (
                                                    <div>
                                                        <p className="font-medium">{item.item_name}</p>
                                                        {inspection.checklist?.items?.[index]?.description && (
                                                            <p className="text-muted-foreground mt-0.5 text-sm">
                                                                {inspection.checklist.items[index].description}
                                                            </p>
                                                        )}
                                                        {inspection.checklist?.items?.[index]?.is_required && (
                                                            <span className="mt-1 inline-block rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600">
                                                                Required
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            className="border-input bg-background w-full rounded-md border px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                                            placeholder="Item name..."
                                                            value={item.item_name}
                                                            onChange={(e) => setItemField(index, 'item_name', e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                {!isChecklist && items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFreeformItem(index)}
                                                        className="mt-0.5 text-red-400 hover:text-red-600"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>

                                            {/* Pass / Fail / N/A buttons */}
                                            <div className="mb-3 flex items-center gap-2">
                                                <Label className="text-muted-foreground text-xs">Result:</Label>
                                                {(['pass', 'fail', 'na'] as const).map((r) => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => setItemField(index, 'result', r)}
                                                        className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
                                                            item.result === r
                                                                ? r === 'pass'
                                                                    ? 'border-green-500 bg-green-100 text-green-800'
                                                                    : r === 'fail'
                                                                      ? 'border-red-500 bg-red-100 text-red-800'
                                                                      : 'border-gray-400 bg-gray-100 text-gray-700'
                                                                : 'border-border text-muted-foreground hover:bg-muted'
                                                        }`}
                                                    >
                                                        {r === 'na' ? 'N/A' : r.charAt(0).toUpperCase() + r.slice(1)}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Item notes */}
                                            <Textarea
                                                placeholder="Notes for this item (optional)..."
                                                value={item.notes}
                                                onChange={(e) => setItemField(index, 'notes', e.target.value)}
                                                rows={2}
                                                className="text-sm"
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Overall Result */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Overall Result</CardTitle>
                                    <CardDescription>Final determination for this inspection.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Pass / Reject */}
                                    <div className="space-y-2">
                                        <Label>Overall Result *</Label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setOverallResult('pass')}
                                                className={`flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors ${
                                                    overallResult === 'pass'
                                                        ? 'border-green-500 bg-green-50 text-green-800'
                                                        : 'border-border text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Pass
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setOverallResult('reject')}
                                                className={`flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors ${
                                                    overallResult === 'reject'
                                                        ? 'border-red-500 bg-red-50 text-red-800'
                                                        : 'border-border text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rejection Reason */}
                                    {overallResult === 'reject' && (
                                        <div className="space-y-1">
                                            <Label htmlFor="rejection_reason">
                                                Rejection Reason <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="rejection_reason"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Describe the reason for rejection..."
                                                rows={3}
                                            />
                                        </div>
                                    )}

                                    {/* Overall notes */}
                                    <div className="space-y-1">
                                        <Label htmlFor="submit_notes">Overall Notes (optional)</Label>
                                        <Textarea
                                            id="submit_notes"
                                            value={submitNotes}
                                            onChange={(e) => setSubmitNotes(e.target.value)}
                                            placeholder="Any additional notes..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={submitProcessing || !overallResult}
                                            className={overallResult === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                                        >
                                            {submitProcessing
                                                ? 'Submitting...'
                                                : overallResult === 'reject'
                                                  ? 'Submit — Reject'
                                                  : overallResult === 'pass'
                                                    ? 'Submit — Pass'
                                                    : 'Submit Inspection'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ── PASS / REJECT: Read-only Results ── */}
                    {(inspection.status === 'pass' || inspection.status === 'reject') && (
                        <div className="space-y-6">
                            {/* Summary card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inspection Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <p className="text-muted-foreground text-sm font-medium">Final Result</p>
                                            <div className="mt-1">
                                                <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                                            </div>
                                        </div>

                                        {inspection.inspector && (
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium">Inspected By</p>
                                                <p className="mt-1 text-sm">{inspection.inspector.name}</p>
                                            </div>
                                        )}

                                        {inspection.inspection_date && (
                                            <div>
                                                <p className="text-muted-foreground text-sm font-medium">Inspection Date</p>
                                                <p className="mt-1 text-sm">{format(new Date(inspection.inspection_date), 'LLL dd, yyyy HH:mm')}</p>
                                            </div>
                                        )}

                                        {inspection.notes && (
                                            <div className="sm:col-span-2">
                                                <p className="text-muted-foreground text-sm font-medium">Notes</p>
                                                <p className="mt-1 text-sm">{inspection.notes}</p>
                                            </div>
                                        )}

                                        {inspection.status === 'reject' && inspection.rejection_reason && (
                                            <div className="sm:col-span-3">
                                                <p className="text-sm font-medium text-red-600">Rejection Reason</p>
                                                <p className="mt-1 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                                    {inspection.rejection_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Results table */}
                            {inspection.results && inspection.results.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Check Results</CardTitle>
                                        <CardDescription>{inspection.results.length} item(s) inspected.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>#</TableHead>
                                                    <TableHead>Check Item</TableHead>
                                                    <TableHead className="text-center">Result</TableHead>
                                                    <TableHead>Notes</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {inspection.results.map((result, index) => {
                                                    const resCfg = resultConfig[result.result] ?? {
                                                        label: result.result,
                                                        className: 'bg-gray-100 text-gray-700',
                                                    };
                                                    return (
                                                        <TableRow key={result.id}>
                                                            <TableCell className="text-muted-foreground text-sm">{index + 1}</TableCell>
                                                            <TableCell className="font-medium">{result.item_name}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge className={resCfg.className}>{resCfg.label}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">{result.notes ?? '-'}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
