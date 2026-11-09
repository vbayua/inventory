import { columns } from "@/components/boms/columns";
import { DataTable } from "@/components/boms/data-table";
import ContainerLayout from "@/components/container-layout";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import AppLayout from "@/layouts/app-layout";
import { Bom } from "@/types/resources";
import { Link, router } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";

export default function Index({boms} : {boms: Bom[]}) {
    return (
        <AppLayout>
            <ContainerLayout>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-2xl font-bold">BoMs</h1>
                        <p className="text-muted-foreground mb-6 text-sm">Bill of Material Index.</p>
                    </div>
                    <div>
                        <ButtonGroup>
                            <Button variant="default" asChild>
                                <Link href={route('bom.create')}>
                                        Create New BoM
                                </Link>
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
                <div>
                    <DataTable columns={columns} data={boms} clientSide onRowClick={(row) => router.visit(route('bom.show', { id: row.id }))} />
                </div>
            </ContainerLayout>
        </AppLayout>
    );
}
