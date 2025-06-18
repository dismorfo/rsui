import { usePage } from '@inertiajs/react';
import type { Collection, Partner } from '@/types';
import { PartnerCollectionsTable } from "@/components/data-table"
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';

export default function Partner() {

    const { partner } = usePage<{
        partner: Partner;
    }>().props;

    const { collection } = usePage<{
        collection: Collection;
    }>().props;


    // Define breadcrumbs AFTER 'partner' is available
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Partners',
            href: '/dashboard',
        },
        {
            title: partner.name,
            href: `/partners/${partner.id}`,
        },
        {
            title: partner.name,
            href: `/collections/${partner.id}`,
        },
    ];

    console.log(partner)

    console.log(collection)

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Partners" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{partner.name}</h4>
                <Separator />
                <h5 className="scroll-m-20 text-l font-semibold tracking-tight">Partner collections</h5>
            </div>
        </AppLayout>
    );
}
