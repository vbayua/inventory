import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { type WarehouseStock } from './types';

const chartConfig = {
    products: {
        label: 'Products',
        theme: { light: '#2a78d6', dark: '#3987e5' },
    },
} satisfies ChartConfig;

const BAR_ROW_HEIGHT = 44;

export const STOCK_BY_WAREHOUSE_TITLE = 'Stock by warehouse';
export const STOCK_BY_WAREHOUSE_DESCRIPTION = 'Distinct products with quantity on hand';

export default function StockByWarehouseChart({ warehouses }: { warehouses: WarehouseStock[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{STOCK_BY_WAREHOUSE_TITLE}</CardTitle>
                <CardDescription>{STOCK_BY_WAREHOUSE_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent>
                {warehouses.length === 0 ? (
                    <p className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">No stock on hand yet.</p>
                ) : (
                    <ChartContainer config={chartConfig} className="w-full" style={{ height: Math.max(250, warehouses.length * BAR_ROW_HEIGHT) }}>
                        <BarChart accessibilityLayer data={warehouses} layout="vertical" margin={{ right: 40 }} barCategoryGap={8}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" dataKey="products" hide allowDecimals={false} />
                            <YAxis type="category" dataKey="warehouse" tickLine={false} axisLine={false} width={140} tickMargin={8} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
                            <Bar dataKey="products" fill="var(--color-products)" radius={[0, 4, 4, 0]} maxBarSize={28}>
                                <LabelList dataKey="products" position="right" offset={8} className="fill-foreground" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
