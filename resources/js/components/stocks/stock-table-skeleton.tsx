import { Item } from "../ui/item";
import { Skeleton } from "../ui/skeleton";

export default function StockTableSkeleton() {

    return (
        <div className="my-4">
            <div className="w-full border">
            {Array.from({length: 4}).map((_, i) => (
                <Item key={i}>
                    <Skeleton className="h-4 w-full" />
                </Item>
            ))}
            </div>
        </div>
    )
}
