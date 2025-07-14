import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Partner } from '@/types';
import { Head } from '@inertiajs/react';
import { PartnersTable } from "@/components/PartnersTable"

export default function Dashboard() {

    const { partners } = usePage<{
        partners: Partner[];
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Partners',
            href: '/dashboard',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Partners" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <PartnersTable partners={partners} />
            </div>
        </AppLayout>
    );
}
