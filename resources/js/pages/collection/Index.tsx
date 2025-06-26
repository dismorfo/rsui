import { usePage } from '@inertiajs/react';
import type { Collection, Partner } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';

export default function Partner() {

    const { collection } = usePage<{
        collection: Collection;
    }>().props;

    const { partner } = collection

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
            title: collection.name,
            href: `/collections/${collection.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Partners" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{collection.name}</h4>
                <Separator />
                <h5 className="scroll-m-20 text-l font-semibold tracking-tight">{partner.name}</h5>
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead></thead>
                        <tbody>
                            <tr className="[&>td]:whitespace-nowrap dark:[&>td]:hover:bg-gray-400">
                                <td className="border px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right">Partner Code</td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{partner.code}</td>
                            </tr>
                            <tr className="[&>td]:whitespace-nowrap dark:[&>td]:hover:bg-gray-400">
                                <td className="border px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right">Partner R* Path</td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{partner.path}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <Separator />
                <h5 className="scroll-m-20 text-l font-semibold tracking-tight">{collection.name}</h5>
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead></thead>
                        <tbody>
                            <tr className="[&>td]:whitespace-nowrap dark:[&>td]:hover:bg-gray-400">
                                <td className="border px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right">Collection Long Name</td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{collection.name}</td>
                            </tr>
                            <tr className="[&>td]:whitespace-nowrap dark:[&>td]:hover:bg-gray-400">
                                <td className="border px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right">Collection Code</td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{collection.code}</td>
                            </tr>
                            <tr className="[&>td]:whitespace-nowrap dark:[&>td]:hover:bg-gray-400">
                                <td className="border px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right">Collection R* Code</td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{collection.code}</td>
                            </tr>
                            <tr className="[&>td]:whitespace-nowrap dark:[&>td]:hover:bg-gray-400">
                                <td className="border px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right">R* Path</td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{collection.path}</td>
                            </tr>
                            <tr className="[&>td]:whitespace-nowrap dark:[&>td]:hover:bg-gray-400">
                                <td className="border px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right">Ready for Content?</td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{collection.ready_for_content ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr className="[&>td]:whitespace-nowrap dark:[&>td]:hover:bg-gray-400">
                                <td className="border px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right">Quota (GB)</td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">{collection.quota.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <Separator />
                <h5 className="scroll-m-20 text-l font-semibold tracking-tight">Perspectives</h5>
            </div>
        </AppLayout>
    );
}
