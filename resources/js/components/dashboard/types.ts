export type DashboardStats = {
    products_in_stock: number;
    low_stock: number;
    out_of_stock: number;
    expiring_batches: number;
    expired_batches: number;
    open_purchase_orders: number;
    overdue_purchase_orders: number;
    pending_inspections: number;
    active_production_orders: number;
};

export type WarehouseStock = {
    warehouse: string;
    products: number;
};

export type StockMovement = {
    date: string;
    inbound: number;
    outbound: number;
};

export type TopMover = {
    product_id: number;
    product: string | null;
    movements: number;
};

export type LowStockItem = {
    id: number;
    product: string | null;
    location: string | null;
    quantity: number;
    minimum_quantity: number;
    unit: string;
};

export type ExpiringBatch = {
    id: number;
    batch_number: string;
    product: string | null;
    expiry_date: string;
    is_expired: boolean;
};

export type PendingInspection = {
    id: number;
    product: string | null;
    receive_number: string | null;
    status: string;
    created_at: string;
};

export type OverduePurchaseOrder = {
    id: number;
    po_number: string;
    supplier: string | null;
    expected_delivery_date: string;
    status: string;
};

export type RecentOperation = {
    id: number;
    operation_type: 'initial' | 'inbound' | 'outbound' | 'transfer' | 'adjustment';
    product: string | null;
    location: string | null;
    quantity: number;
    unit: string;
    user: string | null;
    operation_date: string;
};

const quantityFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export function formatQuantity(quantity: number): string {
    return quantityFormatter.format(quantity);
}
