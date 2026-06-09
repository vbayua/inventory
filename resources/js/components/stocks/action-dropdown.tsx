import { Stock } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ArrowRightToLine, EyeIcon, MenuIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export function ActionDropdown({ item }: { item: Stock }) {
    const [dropDown, setDropDown] = useState(false);

    return (
        <DropdownMenu open={dropDown} onOpenChange={setDropDown}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <MenuIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                    <Link href={route('stocks.show', item.id)}>
                        <EyeIcon className="h-4 w-4" />
                        View Details
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={route('operations.create', { stock_id: item.id, operation_type: 'inbound' })}>
                        <ArrowRightToLine className="h-4 w-4" />
                        Stock In
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
