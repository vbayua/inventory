import { User } from '.';

export interface Category {
    id: number;
    name: string;
    slug?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProductType {
    id: number;
    name: string;
    type_code: string;
    description?: string;
    batch_interval_days?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: number;
    name: string;
    brand_name?: string;
    scientific_name?: string;
    sku: string;
    unit: string;
    price?: number;
    category_id?: number;
    product_type_id?: number;
    supplier_id?: number;
    categories?: Category;
    product_type?: ProductType;
    created_at?: string;
    updated_at?: string;
    pivot?: SupplierProductsPivot;
    suppliers?: Supplier[];
}

export interface Partner {
    id: number;
    name: string;
    email?: string;
    phone_number?: string;
    contact_person?: string;
    address?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Supplier {
    id: number;
    partner_id: number;
    email?: string;
    phone_number?: string;
    contact_person?: string;
    address?: string;
    partner?: Partner;
    pivot?: SupplierProductsPivot;
    products?: Product[];
}

export interface SupplierProductsPivot extends Supplier {
    id: number;
    supplier_id: number;
    product_id: number;
    price: string | number;
    created_at?: string;
    updated_at?: string;
}

export interface Warehouse {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Location {
    id: number;
    name: string;
    warehouse_id: number;
    warehouse?: Warehouse;
    created_at?: string;
    updated_at?: string;
}

export interface Unit {
    name: string;
    conversion_to_base: number;
    base_unit: string;
    unit_type: string;
    created_at?: string;
    updated_at?: string;
}

export interface Batch {
    id: number;
    product_id: number;
    batch_number: string;
    minimum_quantity: number;
    manufacture_date?: string;
    expiry_date?: string;
    user_id?: number;
    supplier_id?: number;
    product?: Product;
    supplier?: Supplier;
    created_at?: string;
    updated_at?: string;
}
export enum Status {
    pending = 'pending',
    checking = 'checking',
    pass = 'pass',
    reject = 'reject',
    reserved = 'reserved',
}

export enum OrderStatus {
    pending = 'pending',
    partially_received = 'partially_received',
    received = 'received',
    completed = 'completed',
    cancelled = 'cancelled',
}

export interface Stock {
    id: number;
    product_id: number;
    batch_id: number;
    location_id: number;
    quantity: string;
    unit: string;
    minimum_quantity?: number;
    container_capacity: number;
    container_unit: string;
    status: Status;
    remarks: 'string';
    user_id?: number;
    batch?: Batch;
    product?: Product;
    location?: Location;
    user?: User;
    created_at?: string;
    updated_at?: string;
}

export enum OperationType {
    initial = 'initial',
    inbound = 'inbound',
    transfer = 'transfer',
    transfer_in = 'transfer-in',
    transfer_out = 'transfer-out',
    outbound = 'outbound',
    adjustment = 'adjustment',
    return = 'return',
    shipping = 'shipping',
}

export interface Operation {
    id: number;
    operation_type: OperationType;
    product: Product & Record<string, unknown>;
    location: Location & Record<string, unknown>;
    batch: Batch & Record<string, unknown>;
    user?: User & Record<string, unknown>;
    unit: string;
    quantity: number;
    remarks: string;
    created_at: string;
    operation_date: string;
}

export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    product_id: number;
    location_id: number;
    quantity: number;
    price: number;
    location?: Location;
    product?: Product;
    created_at?: string;
    updated_at?: string;
}

export interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_id: number;
    order_date: string;
    status: string;
    expected_delivery_date?: string;
    notes?: string;
    user_id?: number;
    supplier?: Supplier;
    items?: PurchaseOrderItem[];
    created_at?: Date | string;
    updated_at?: Date | string;
    user?: User;
}

export interface ReceiveOrder {
    id: number;
    receive_number: string;
    reference_number?: string;
    purchase_order_id: number;
    receive_date: string;
    notes?: string;
    purchase_order?: PurchaseOrder;
    created_at?: string;
    updated_at?: string;
    receive_order_items?: ReceiveOrderItem[];
    user_id?: number;
    user?: User;
}

export interface ReceiveOrderItem {
    id: number;
    receive_order_id: number;
    product_id: number;
    quantity_received: number;
    product?: Product;
    created_at?: string;
    updated_at?: string;
    purchase_order_item?: PurchaseOrderItem;
    location?: Location;
    notes?: string;
    qc_inspection?: QcInspection;
}

export interface QcChecklistItem {
    id: number;
    qc_checklist_id: number;
    item_name: string;
    description?: string;
    is_required: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface QcChecklist {
    id: number;
    name: string;
    description?: string;
    product_type_id?: number;
    is_active: boolean;
    user_id?: number;
    product_type?: ProductType;
    items?: QcChecklistItem[];
    items_count?: number;
    user?: User;
    created_at?: string;
    updated_at?: string;
}

export interface QcInspectionResult {
    id: number;
    qc_inspection_id: number;
    qc_checklist_item_id?: number;
    item_name: string;
    result: 'pass' | 'fail' | 'na';
    notes?: string;
    checklist_item?: QcChecklistItem;
    created_at?: string;
    updated_at?: string;
}

export interface QcInspection {
    id: number;
    receive_order_id: number;
    receive_order_item_id: number;
    qc_checklist_id?: number;
    inspector_user_id?: number;
    status: 'pending' | 'checking' | 'pass' | 'reject' | 'partial_pass';
    inspection_date?: string;
    notes?: string;
    rejection_reason?: string;
    quantity_passed?: number | null;
    quantity_rejected?: number | null;
    receive_order?: ReceiveOrder;
    receive_order_item?: ReceiveOrderItem;
    checklist?: QcChecklist;
    results?: QcInspectionResult[];
    inspector?: User;
    created_at?: string;
    updated_at?: string;
}
