import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Product } from '@/types/resources';
import { router } from '@inertiajs/react';
import { FilterIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ProductsWithLinks extends Product {
    links: {
        active: boolean;
        label: string;
        page: number;
        url: string;
    }[];
    data: Product[];
    total?: number;
    from?: number;
    to?: number;
}

interface ProductSelectDialogProps {
    products: ProductsWithLinks[];
    onProductSelect: (product: Product) => void;
    selectedProduct: Product | undefined;
    productDialogOpen: boolean;
    setProductDialogOpen: (open: boolean) => void;
}

export default function ProductSelectDialog({
    products,
    onProductSelect,
    selectedProduct,
    productDialogOpen,
    setProductDialogOpen,
}: ProductSelectDialogProps) {
    const [searchTerm, setSearchTerm] = useState({
        search_term: '',
        has_stock: false,
    });

    const searchProduct = (params: { search_term: string; has_stock: boolean }) => {
        router.visit(route('operations.create', params), {
            only: ['products'],
            preserveState: true,
            preserveScroll: true,
        });
    };

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedSearch = (value: { search_term: string; has_stock: boolean }) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            searchProduct(value);
        }, 300);
    };

    useEffect(() => {
        if (!productDialogOpen) {
            setSearchTerm({ search_term: '', has_stock: false });
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            // Reset products filter when dialog closes
            router.visit(route('operations.create'), {
                only: ['products'],
                preserveScroll: true,
                preserveState: true,
            });
        }
    }, [productDialogOpen]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
            <DialogContent className="w-full">
                <DialogHeader>
                    <DialogTitle>Product List</DialogTitle>
                </DialogHeader>
                <ButtonGroup className="w-full">
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm.search_term}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchTerm({ ...searchTerm, search_term: value });
                        }}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" aria-label="Search" size="sm">
                                <FilterIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Filters</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem
                                    checked={searchTerm.has_stock}
                                    onCheckedChange={(checked) => {
                                        setSearchTerm({ ...searchTerm, has_stock: checked });
                                    }}
                                    className={cn('flex items-center gap-2', { 'bg-muted': searchTerm.has_stock })}
                                >
                                    <span>Has Stock</span>
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/*<Button
                    onClick={() => {
                        debouncedSearch(searchTerm);
                    }}
                    type="button"
                    aria-label="Search"
                    size="sm"
                >
                    Filters
                    <FilterIcon />
                </Button>*/}
                </ButtonGroup>
                <div className="mb-2 flex w-full items-center gap-2">
                    <Button
                        onClick={() => {
                            debouncedSearch(searchTerm);
                        }}
                        type="button"
                        className="w-full"
                        aria-label="Search"
                        size="sm"
                    >
                        Apply Filters
                    </Button>
                </div>
                <div className="relative max-h-96 w-full overflow-y-auto rounded-md border">
                    <table className="w-full caption-bottom text-sm">
                        <TableHeader className="bg-muted sticky top-0 z-10 font-medium *:font-bold">
                            <TableRow>
                                <TableHead>Product</TableHead>
                                {/*<TableHead>Quantity</TableHead>*/}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.map((product: Product) => (
                                <TableRow
                                    key={product.id}
                                    onClick={() => {
                                        onProductSelect(product);
                                        setProductDialogOpen(false);
                                    }}
                                    className={selectedProduct?.id === product.id ? 'bg-muted/40' : ''}
                                >
                                    <TableCell>
                                        <div className="grid grid-cols-1">
                                            <span>{product.name}</span>
                                            <span>{product.sku}</span>
                                        </div>
                                    </TableCell>
                                    {/*<TableCell>{product.quantity}</TableCell>*/}
                                </TableRow>
                            ))}
                        </TableBody>
                    </table>
                </div>
                <div className="flex items-center justify-center">
                    <div>
                        <span className="text-sm">
                            {products.from} to {products.to} out of {products.total} items
                        </span>
                    </div>
                </div>
                <div className="max-w-md overflow-x-auto">
                    <Pagination>
                        <PaginationContent>
                            {products.links &&
                                products.links.map((link) => (
                                    <>
                                        {link.label.includes('Previous') && (
                                            <PaginationItem>
                                                <PaginationPrevious preserveState href={link.url || '#'} />
                                            </PaginationItem>
                                        )}
                                        {link.label.includes('Next') && (
                                            <PaginationItem>
                                                <PaginationNext preserveState href={link.url || '#'} />
                                            </PaginationItem>
                                        )}
                                    </>
                                ))}
                        </PaginationContent>
                    </Pagination>
                </div>
            </DialogContent>
        </Dialog>
    );
}
