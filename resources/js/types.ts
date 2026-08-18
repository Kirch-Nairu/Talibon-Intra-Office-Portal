export type Department = {
    id: number;
    code: string;
    name: string;
    short_name?: string | null;
};

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    employee: null | {
        employee_number: string;
        position: string;
        department: Department | null;
    };
};

export type PendingMemo = {
    id: number;
    memo_number: string;
    title: string;
    issuer?: string | null;
    department?: string | null;
    requires_acknowledgement: boolean;
};

export type SharedProps = {
    [key: string]: unknown;
    appName: string;
    auth: { user: AuthUser | null };
    pendingMemo: PendingMemo | null;
    unreadMemoCount: number;
    flash: { success?: string; error?: string };
};
