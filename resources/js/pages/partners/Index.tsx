import { usePage } from '@inertiajs/react';
import { Partner } from '@/types';
import { PartnersTable } from "@/components/data-table"
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, RBSE } from '@/types';
import { Head } from '@inertiajs/react';

export default function Dashboard() {

    const { rsbe, partners } = usePage<{
        partners: Partner[];
        rsbe: RBSE;
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Partners',
            href: '/dashboard',
        },
    ];

    const timestampInMilliseconds = Number(rsbe.expires) * 1000;

    // Create a new Date object
    const date = new Date(timestampInMilliseconds);

    // Option 1: Using toLocaleString() for a localized format (recommended for display)
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true // Use 12-hour clock with AM/PM
    };

    const formattedDate = date.toLocaleString('en-US', options); // 'en-US' for English (United States) locale

    console.log("Formatted Date (Local Time):", formattedDate);

    console.log(usePage<{
        partners: Partner[];
        rsbe: RBSE;
    }>().props);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Partners" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <PartnersTable partners={partners} />
            </div>
        </AppLayout>
    );
}
