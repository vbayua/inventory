import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import { type TopMover } from './types';

const chartConfig = {
    movements: {
        label: 'Outbound operations',
        theme: { light: '#2a78d6', dark: '#3987e5' },
    },
} satisfies ChartConfig;

const BAR_ROW_HEIGHT = 32;
const MAX_LABEL_LENGTH = 22;

const truncateLabel = (label: string) => (label.length > MAX_LABEL_LENGTH ? `${label.slice(0, MAX_LABEL_LENGTH - 1)}…` : label);

export const TOP_MOVERS_TITLE = 'Top movers';
export const TOP_MOVERS_DESCRIPTION = 'Products with the most outbound operations, last 30 days';

export default function TopMoversChart({ movers }: { movers: TopMover[] }) {
    const data = movers.map((mover) => ({ ...mover, product: mover.product ?? `Product #${mover.product_id}` }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>{TOP_MOVERS_TITLE}</CardTitle>
                <CardDescription>{TOP_MOVERS_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <p className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">
                        No outbound operations in the last 30 days.
                    </p>
                ) : (
                    <ChartContainer config={chartConfig} className="w-full" style={{ height: Math.max(250, data.length * BAR_ROW_HEIGHT) }}>
                        <BarChart accessibilityLayer data={data} layout="vertical" margin={{ right: 40 }} barCategoryGap={4}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" dataKey="movements" hide allowDecimals={false} />
                            <YAxis
                                type="category"
                                dataKey="product"
                                tickLine={false}
                                axisLine={false}
                                width={160}
                                tickMargin={8}
                                interval={0}
                                tickFormatter={truncateLabel}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
                            <Bar dataKey="movements" fill="var(--color-movements)" radius={[0, 4, 4, 0]} maxBarSize={24}>
                                <LabelList dataKey="movements" position="right" offset={8} className="fill-foreground" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
