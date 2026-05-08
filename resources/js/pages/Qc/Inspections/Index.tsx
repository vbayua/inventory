import ContainerLayout from '@/components/container-layout';
import { columns } from '@/components/qc/inspections/columns';
import { DataTable } from '@/components/qc/inspections/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { QcInspection } from '@/types/resources';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Quality Control', href: '/qc/inspections' },
    { title: 'Inspections', href: '/qc/inspections' },
];

type FilterTab = 'all' | 'pending' | 'checking' | 'pass' | 'reject' | 'approved' | 'partial_pass';

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
    checking: { label: 'Checking', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
    pass: { label: 'Pass', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    reject: { label: 'Reject', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    partial_pass: { label: 'Partial Pass', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
};

const tabLabels: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'checking', label: 'Checking' },
    { key: 'pass', label: 'Pass' },
    { key: 'reject', label: 'Reject' },
    { key: 'approved', label: 'Approved' },
    { key: 'partial_pass', label: 'Partial Pass' },
];

export default function Index({ inspections }: { inspections: QcInspection[] }) {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const filtered = activeTab === 'all' ? inspections : inspections.filter((i) => i.status === activeTab);

    const countFor = (tab: FilterTab) => (tab === 'all' ? inspections.length : inspections.filter((i) => i.status === tab).length);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="QC Inspections" />
            <ContainerLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">QC Inspections</h1>
                            <p className="text-muted-foreground mt-1 text-sm">Quality control inspections for received items.</p>
                        </div>
                    </div>
                    <DataTable data={inspections} columns={columns} clientSide={true} />
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
