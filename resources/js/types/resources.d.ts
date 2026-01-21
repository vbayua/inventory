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
    supplier_id?: number;
    categories?: Category;
    product_type?: ProductType;
    created_at?: string;
    updated_at?: string;
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

export interface Stock {
    id: number;
    product_id: number;
    batch_id: number;
    location_id: number;
    quantity: number;
    unit: string;
    minimum_quantity?: number;
    container_capacity: number;
    container_unit: string;
    status: 'available' | 'reserved' | 'expired' | 'out_of_stock' | 'low_stock';
    remarks: 'string';
    user_id?: number;
    created_at?: string;
    updated_at?: string;
}
