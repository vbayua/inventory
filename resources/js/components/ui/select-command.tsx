import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ReactNode } from 'react';

type SelectCommandProps<T> = {
    lists?: T[];
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
                            return (
                                <CommandItem
                                    key={key}
                                    value={searchValue}
                                    onSelect={() => {
                                        onSelect(item);
                                    }}
                                    className="flex w-full justify-between"
                                >
                                    {renderItem ? renderItem(item) : label}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                )}
            </CommandList>
        </Command>
    );
}
