export type Department = {
    id: number;
    code: string;
    name: string;
    short_name?: string | null;
    branch?: string;
    office_type?: string;
    is_routable?: boolean;
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

export type LiveNotification = {
    id?: number;
    key: string;
    type: 'memorandum' | 'transaction' | string;
    title: string;
    message: string;
    url: string;
    read_url?: string | null;
    acknowledgement_url?: string | null;
    created_at?: string | null;
    urgent: boolean;
    requires_acknowledgement?: boolean;
};

export type NotificationFeed = {
    pendingMemo: PendingMemo | null;
    unreadMemoCount: number;
    unreadPlatformNotificationCount: number;
    notifications: LiveNotification[];
    notificationCount: number;
};

export type SharedProps = {
    [key: string]: unknown;
    appName: string;
    auth: { user: AuthUser | null };
    pendingMemo: PendingMemo | null;
    unreadMemoCount: number;
    unreadPlatformNotificationCount: number;
    notifications: LiveNotification[];
    notificationCount: number;
    flash: { success?: string; error?: string };
};
