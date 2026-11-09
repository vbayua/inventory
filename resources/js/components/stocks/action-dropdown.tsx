import { Stock } from '@/types/resources';
import { Link } from '@inertiajs/react';
import { ArrowRightToLine, EyeIcon, FileInputIcon, FileOutputIcon, MoreHorizontalIcon, MoreVerticalIcon, MoveHorizontal, MoveHorizontalIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ActionDropdown({ item, className }: { item: Stock; className?: string }) {
    const [dropDown, setDropDown] = useState(false);

    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            <DropdownMenu open={dropDown} onOpenChange={setDropDown}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild>
                        <Link href={route('stocks.show', item.id)}>
                            <EyeIcon className="h-4 w-4" />
                            View Details
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href={route('operations.create', { stock_id: item.id, operation_type: 'inbound' })}>
                                <FileInputIcon className="h-4 w-4" />
                                Stock In
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('operations.create', { stock_id: item.id, operation_type: 'outbound' })}>
                                <FileOutputIcon className="h-4 w-4" />
                                Stock Out
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('operations.create', { stock_id: item.id, operation_type: 'transfer' })}>
                                <MoveHorizontalIcon className="h-4 w-4" />
                                Move Stock
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
