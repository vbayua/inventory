import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { type StockMovement } from './types';

const chartConfig = {
    inbound: {
        label: 'Inbound',
        theme: { light: '#2a78d6', dark: '#3987e5' },
    },
    outbound: {
        label: 'Outbound',
        theme: { light: '#eb6834', dark: '#d95926' },
    },
} satisfies ChartConfig;

export const STOCK_MOVEMENT_TITLE = 'Stock movement';
export const STOCK_MOVEMENT_DESCRIPTION = 'Inbound vs outbound operations per day, last 30 days';

const formatDay = (date: string) => format(parseISO(date), 'd MMM');

function StockMovementCard({ children }: { children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{STOCK_MOVEMENT_TITLE}</CardTitle>
                <CardDescription>{STOCK_MOVEMENT_DESCRIPTION}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

export default function StockMovementChart({ movements }: { movements: StockMovement[] }) {
    return (
        <StockMovementCard>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart accessibilityLayer data={movements} margin={{ left: -20, right: 12, top: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={formatDay} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                    <ChartTooltip cursor content={<ChartTooltipContent indicator="line" labelFormatter={(date: string) => formatDay(date)} />} />
                    <Line dataKey="inbound" type="monotone" stroke="var(--color-inbound)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line dataKey="outbound" type="monotone" stroke="var(--color-outbound)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
            </ChartContainer>
        </StockMovementCard>
    );
}
