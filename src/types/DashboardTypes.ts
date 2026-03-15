export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    joined_at?: string;
    username?: string;
    accessible_orderlines?: number[];
    profile_pic?: string;
}

export interface ProfileRequest {
    id: number;
    employee_id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    created_at: string;
    current_first_name: string;
    current_last_name: string;
}

export interface OrderLine {
    id: number;
    name: string;
    node_id: string;
    created_at?: string;
}

export interface OlRequest {
    id: number;
    order_line_id: number;
    order_line_name: string;
    node_id: string;
    first_name: string;
    last_name: string;
    status: string;
    created_at: string;
}

export interface EmployeeFormData {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    username: string;
    password: string;
    accessible_orderlines: number[];
}
