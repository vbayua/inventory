import ContainerLayout from "@/components/container-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Link } from "@inertiajs/react";
import { CheckIcon, EditIcon } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Production Plan",
        href: route('production.index'),
    },
    {
        title: "Production Plan Detail",
        href: route('production.show', {id: 1}),
    }
]
export default function Show() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <ContainerLayout>
                <h1>Production Plan Detail</h1>

                <div className="mb-6 p-4">
                    Plan Number: 010231-4-Parfume

                </div>
                <div className="mb-6 p-4">
                    <h2>Bill of Materials</h2>
                </div>
                <div className="max-w-2/4 max-h-dvh border rounded-lg overflow-y-auto overflow-x-hidden">
                    <Item variant={"outline"}>
                        <ItemMedia>
                            <Badge variant={"outline"}>200/200</Badge>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>2010231-4-Parfume </ItemTitle>
                            <ItemDescription>Description</ItemDescription>
                       </ItemContent>
                        <ItemActions>
                           <Button variant={"outline"} size="sm">
                               <EditIcon className="w-4"/>
                           </Button>
                       </ItemActions>
                    </Item>
                    <Item variant={"outline"}>
                        <ItemMedia>
                            <Badge variant={"outline"}>200/200</Badge>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>2010231-4-Parfume </ItemTitle>
                            <ItemDescription>Description</ItemDescription>
                       </ItemContent>
                     </Item>

                    <Item variant={"outline"}>
                        <ItemMedia>
                            <Badge variant={"outline"}>200/200</Badge>
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle>2010231-4-Parfume </ItemTitle>
                            <ItemDescription>Description</ItemDescription>
                        </ItemContent>
                      </Item>
                      <Item variant={"outline"}>
                          <ItemMedia>
                              <Badge variant={"outline"}>200/200</Badge>
                          </ItemMedia>
                          <ItemContent>
                              <ItemTitle>2010231-4-Parfume </ItemTitle>
                              <ItemDescription>Description</ItemDescription>
                         </ItemContent>
                          <ItemActions>
                             <Button variant={"outline"} size="sm">
                                 <EditIcon className="w-4"/>
                             </Button>
                         </ItemActions>
                      </Item>
                      <Item variant={"outline"}>
                          <ItemMedia>
                              <Badge variant={"outline"}>200/200</Badge>
                          </ItemMedia>
                          <ItemContent>
                              <ItemTitle>2010231-4-Parfume </ItemTitle>
                              <ItemDescription>Description</ItemDescription>
                         </ItemContent>
                          <ItemActions>
                             <Button variant={"outline"} size="sm">
                                 <EditIcon className="w-4"/>
                             </Button>
                         </ItemActions>
                      </Item>
                      <Item variant={"outline"}>
                          <ItemMedia>
                              <Badge variant={"outline"}>200/200</Badge>
                          </ItemMedia>
                          <ItemContent>
                              <ItemTitle>2010231-4-Parfume </ItemTitle>
                              <ItemDescription>Description</ItemDescription>
                         </ItemContent>
                          <ItemActions>
                             <Button variant={"outline"} size="sm">
                                 <EditIcon className="w-4"/>
                             </Button>
                         </ItemActions>
                      </Item>
                      <Item variant={"outline"}>
                          <ItemMedia>
                              <Badge variant={"outline"}>200/200</Badge>
                          </ItemMedia>
                          <ItemContent>
                              <ItemTitle>2010231-4-Parfume </ItemTitle>
                              <ItemDescription>Description</ItemDescription>
                         </ItemContent>
                          <ItemActions>
                             <Button variant={"outline"} size="sm">
                                 <EditIcon className="w-4"/>
                             </Button>
                         </ItemActions>
                      </Item>
                      <Item variant={"outline"}>
                          <ItemMedia>
                              <Badge variant={"outline"}>200/200</Badge>
                          </ItemMedia>
                          <ItemContent>
                              <ItemTitle>2010231-4-Parfume </ItemTitle>
                              <ItemDescription>Description</ItemDescription>
                         </ItemContent>
                          <ItemActions>
                             <Button variant={"outline"} size="sm">
                                 <EditIcon className="w-4"/>
                             </Button>
                         </ItemActions>
                      </Item>
                      <Item variant={"outline"}>
                          <ItemMedia>
                              <Badge variant={"outline"}>200/200</Badge>
                          </ItemMedia>
                          <ItemContent>
                              <ItemTitle>2010231-4-Parfume </ItemTitle>
                              <ItemDescription>Description</ItemDescription>
                         </ItemContent>
                          <ItemActions>
                             <Button variant={"outline"} size="sm">
                                 <EditIcon className="w-4"/>
                             </Button>
                         </ItemActions>
                      </Item>
                      <Item variant={"outline"}>
                          <ItemMedia>
                              <Badge variant={"outline"}>200/200</Badge>
                          </ItemMedia>
                          <ItemContent>
                              <ItemTitle>2010231-4-Parfume </ItemTitle>
                              <ItemDescription>Description</ItemDescription>
                         </ItemContent>
                          <ItemActions>
                             <Button variant={"outline"} size="sm">
                                 <EditIcon className="w-4"/>
                             </Button>
                         </ItemActions>
                      </Item>
                      <Item variant={"outline"}>
                          <ItemMedia>
                              <Badge variant={"outline"}>200/200</Badge>
                          </ItemMedia>
                          <ItemContent>
                              <ItemTitle>2010231-4-Parfume </ItemTitle>
                              <ItemDescription>Description</ItemDescription>
                         </ItemContent>
                          <ItemActions>
                             <Button variant={"outline"} size="sm">
                                 <EditIcon className="w-4"/>
                             </Button>
                         </ItemActions>
                      </Item>
                      <Item variant={"outline"}>
                          <ItemMedia>
                              <Badge variant={"outline"}>200/200</Badge>
                          </ItemMedia>
                          <ItemContent>
                              <ItemTitle>2010231-4-Parfume </ItemTitle>
                              <ItemDescription>Description</ItemDescription>
                         </ItemContent>
                          <ItemActions>
                             <Button variant={"outline"} size="sm">
                                 <EditIcon className="w-4"/>
                             </Button>
                         </ItemActions>
                      </Item>
                </div>
            </ContainerLayout>
        </AppLayout>
    )
}
