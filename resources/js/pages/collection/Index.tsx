import { usePage } from '@inertiajs/react';
import type { Collection, Partner, FileItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FileExplorer from "@/components/FileExplorer";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@/components/ui/table';

export default function Partner() {

    const { collection, storage_path } = usePage<{
        collection: Collection;
        storage_path: FileItem[];
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
            <Head title={`${collection.name} - ${partner.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{collection.name}</h4>
                <div className="rounded-md border">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Partner Name</TableCell>
                                <TableCell>{partner.name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Partner Code</TableCell>
                                <TableCell>{partner.code}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Partner R* Path</TableCell>
                                <TableCell>{partner.path}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Collection Long Name</TableCell>
                                <TableCell>{collection.name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Collection Code</TableCell>
                                <TableCell>{collection.display_code}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Collection R* Code</TableCell>
                                <TableCell>{collection.code}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">R* Path</TableCell>
                                <TableCell>{collection.path}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Ready for Content?</TableCell>
                                <TableCell>{collection.ready_for_content ? 'Yes' : 'No'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Quota (GB)</TableCell>
                                <TableCell>{collection.quota.toLocaleString()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <h5 className="scroll-m-20 text-l font-semibold tracking-tight">Perspectives</h5>
                <div className="rounded-md border">
                    <FileExplorer storage={storage_path} partnerId={String(partner.id)} collectionId={String(collection.id)} />
                </div>
            </div>
        </AppLayout>
    );
}
