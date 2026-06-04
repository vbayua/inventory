import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type SelectCommandProps<T> = {
    lists?: T[];
    defaultValue?: T;
    onSelect: (item: T) => void;
    placeholder?: string;
    emptyText?: string | ReactNode;
    renderItem?: (item: T) => ReactNode;
    getKey?: (item: T, index: number) => string | number;
    getId?: (item: T) => string | number;
    getLabel?: (item: T) => string;
    getSearchValue?: (item: T) => string;
};

function defaultLabel(item: any): string {
    return item?.id != null ? String(item.id) : 'Unknown';
}

function defaultId(item: any, index: number): string | number {
    if (item?.id != null) return String(item.id);
    return index;
}
export default function SelectCommand<T>({
    lists,
    defaultValue,
    onSelect,
    placeholder = 'Select an item',
    emptyText = 'No data found.',
    renderItem,
    getKey,
    getId,
    getLabel,
    getSearchValue,
}: SelectCommandProps<T>) {
    const resolveKey = (item: any, index: number) => (getKey ? getKey(item, index) : getId ? getId(item) : defaultId(item, index));

    const resolveLabel = (item: any) => (getLabel ? getLabel(item) : defaultLabel(item));
    const resolveSearchValue = (item: any) => (getSearchValue ? getSearchValue(item) : resolveLabel(item));

    const defaultKey = defaultValue ? resolveKey(defaultValue as any, 0) : undefined;
    return (
        <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
                <CommandEmpty>
                    {!lists && <div className="text-muted-foreground p-2 text-sm">Loading...</div>}
                    {lists && <div>{emptyText}</div>}
                </CommandEmpty>
                {lists && lists.length > 0 && (
                    <CommandGroup>
                        {lists.map((item, index) => {
                            const key = resolveKey(item as any, index);
                            const label = resolveLabel(item as any);
                            const searchValue = resolveSearchValue(item as any);
                            const isSelected = defaultKey === key;
                            return (
                                <CommandItem
                                    key={key}
                                    value={searchValue}
                                    onSelect={() => {
                                        onSelect(item);
                                    }}
                                    className={cn('flex w-full justify-between', isSelected && 'bg-accent/50')}
                                >
                                    {renderItem ? renderItem(item) : label}
                                    {isSelected && <span className="text-muted-foreground">✓</span>}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                )}
            </CommandList>
        </Command>
    );
}
