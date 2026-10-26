import { Badge } from "@/components/ui/badge";
import { BomStatus } from "@/types/resources";

const badgeVariant = {
    draft: {
        label: 'Draft',
        variant: 'outline',
        style: 'bg-yellow-800 text-yellow-100 border border-yellow-100'
    },
    active: {
        label: 'Active',
        variant: 'default',
        style: 'bg-blue-800/20 text-blue-100 border border-blue-100'
    },
    retired: {
        label: 'Retired',
        variant: 'outline',
        style: 'bg-red-800 text-red-100 border border-red-100'
    },
} as const satisfies Record<BomStatus, { label: string; variant: 'default' | 'outline'; style: string }>;

export function BomStatusBadge({ status }: { status: BomStatus }) {
    return <Badge variant={badgeVariant[status].variant} size="sm" className={`capitalize ${badgeVariant[status].style}`}>
        <span className="capitalize">{badgeVariant[status].label}</span>
    </Badge>
}
