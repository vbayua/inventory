import React from 'react'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

type PaginationIndexProps = {
    links?: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export const PaginationIndex = ({ links }: PaginationIndexProps) => {
    return (
        <Pagination>
            <PaginationContent>

                {links && (
                    <>
                        {links.map((link) => (
                            <span key={link.label}>
                                {link.label.includes('Previous') && (
                                    <PaginationItem>
                                        <PaginationPrevious href={link.url || '#'} />
                                    </PaginationItem>
                                )}
                                {link.label.includes('Next') && (
                                    <PaginationItem>
                                        <PaginationNext href={link.url || '#'} />
                                    </PaginationItem>
                                )}
                                {!link.label.includes('Previous') && !link.label.includes('Next') && (
                                    <PaginationItem>
                                        <PaginationLink href={link.url || '#'} >
                                            {link.label}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}
                            </span>
                        ))}
                    </>
                )}
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
