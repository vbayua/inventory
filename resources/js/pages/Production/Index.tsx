import ContainerLayout from "@/components/container-layout";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { CheckIcon, Icon } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Production Plan",
        href: "/production",
    }
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Production Plan"/>
            <ContainerLayout>
                <h1>Production Plan</h1>

                <div>
                   <Item>
                      <ItemMedia variant="icon">
                        <CheckIcon />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>2010231-4-Parfume </ItemTitle>
                        <ItemDescription>Description</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                          <Button variant="link" asChild>
                              <Link href={route('production.show', {id: 1})}>Action</Link>
                          </Button>
                      </ItemActions>
                    </Item>
                    <Item>
                        <ItemMedia variant="icon">
                            <CheckIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>2010231-4-Parfume </ItemTitle>
                        <ItemDescription>Description</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button variant="link" asChild>
                                <Link href={route('production.show', {id: 1})}>Action</Link>
                            </Button>
                        </ItemActions>
                    </Item>

                    <Item>
                        <ItemMedia variant="icon">
                            <CheckIcon />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>2010231-4-Parfume </ItemTitle>
                        <ItemDescription>Description</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button variant="link" asChild>
                                <Link href={route('production.show', {id: 1})}>Action</Link>
                            </Button>
                        </ItemActions>
                    </Item>


                </div>
            </ContainerLayout>
        </AppLayout>
    )
}
