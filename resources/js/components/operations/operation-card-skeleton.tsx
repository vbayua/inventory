import { Skeleton } from "../ui/skeleton";

export default function OperationCardSkeleton()
{
    return (
        <div className="mb-6 space-y-6">
            <h1 className="mb-12 text-2xl font-semibold">Operasi Stok</h1>

            <div className="grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    )
}
