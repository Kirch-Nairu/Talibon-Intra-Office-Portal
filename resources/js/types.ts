export type Department = {
    id: number;
    code: string;
    name: string;
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

export type SharedProps = {
    appName: string;
    auth: { user: AuthUser | null };
    flash: { success?: string; error?: string };
};
