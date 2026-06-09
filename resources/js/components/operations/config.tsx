import { ArrowDown, ArrowDownUp, Edit2, LogIn, Minus, Plus } from 'lucide-react';

const operationConfig = {
    inbound: {
        id: 'inbound',
        label: 'IN',
        color: 'bg-green-200 text-green-800',
        variant: 'default' as const,
        icon: Plus,
        prefix: '+',
    },
    outbound: {
        id: 'outbound',
        label: 'OUT',
        color: 'bg-red-200 text-red-800',
        variant: 'secondary' as const,
        icon: Minus,
        prefix: '-',
    },
    initial: {
        id: 'initial',
        label: 'INITIAL',
        color: 'bg-purple-200 text-purple-800',
        variant: 'secondary' as const,
        icon: Plus,
        prefix: '+',
    },
    adjustment: {
        id: 'adjustment',
        label: 'ADJ',
        color: 'bg-yellow-100 text-yellow-800',
        variant: 'outline' as const,
        icon: Edit2,
    },
    transfer: {
        id: 'transfer',
        label: 'Transfer',
        color: 'bg-indigo-100 text-indigo-800',
        variant: 'default' as const,
        icon: LogIn,
    },
    transfer_in: {
        id: 'transfer_in',
        label: 'TRANSFER IN',
        color: 'bg-teal-100 text-teal-800',
        variant: 'default' as const,
        icon: ArrowDownUp,
        prefix: '+',
    },
    transfer_out: {
        id: 'transfer_out',
        label: 'TRANSFER OUT',
        color: 'bg-indigo-100 text-indigo-800',
        variant: 'default' as const,
        icon: ArrowDownUp,
        prefix: '-',
    },
    return: {
        id: 'return',
        label: 'RETURN',
        color: 'bg-cyan-100 text-cyan-800',
        variant: 'default' as const,
        icon: ArrowDown,
        prefix: '+',
    },
};

export default operationConfig;
