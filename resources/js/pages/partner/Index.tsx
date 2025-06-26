import { usePage } from '@inertiajs/react';
import type { BreadcrumbItem, Partner } from '@/types';
import { PartnerCollectionsTable } from "@/components/data-table"
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';

export default function Partner() {

    const { partner } = usePage<{
        partner: Partner;
    }>().props;

    const { collections } = partner;

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
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Partners" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{partner.name}</h4>
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead></thead>
                        <tbody>
                            <tr className="[&>td]:whitespace-nowrap dark:[&>td]:hover:bg-gray-400">
                                <td className="border px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right">Code</td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{partner.code}</td>
                            </tr>
                            <tr className="[&>td]:whitespace-nowrap dark:[&>td]:hover:bg-gray-400">
                                <td className="border px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right">R* Path</td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{partner.path}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <Separator />
                <h5 className="scroll-m-20 text-l font-semibold tracking-tight">Partner collections</h5>
                <PartnerCollectionsTable collections={collections} />
            </div>
        </AppLayout>
    );
}
