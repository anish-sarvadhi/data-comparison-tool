/** @format */

"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search } from "lucide-react";

interface SafeDiamondsTableProps {
  diamonds: any[];
}

export function SafeDiamondsTable({ diamonds }: SafeDiamondsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const filteredDiamonds = diamonds.filter((diamond) => {
    if (!searchTerm) return true;

    return Object.values(diamond).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredDiamonds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDiamonds = filteredDiamonds.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (diamonds.length === 0) {
    return <p className="text-center py-4">No unchanged diamonds found.</p>;
  }

  // Get all field names from the first diamond
  const fieldNames = diamonds.length > 0 ? Object.keys(diamonds[0]) : [];

  // Limit displayed fields to a reasonable number
  const displayFields = fieldNames.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search diamonds..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {displayFields.map((field) => (
                <TableHead key={field}>{field}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDiamonds.map((diamond, index) => (
              <TableRow key={index}>
                {displayFields.map((field) => (
                  <TableCell key={field}>
                    {diamond[field] !== null && diamond[field] !== undefined
                      ? String(diamond[field])
                      : "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage((prev) => prev - 1);
                  }
                }}
                className={
                  currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;

              // Adjust page numbers for large total pages
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 3 + i;
                if (pageNum > totalPages) return null;
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={currentPage === pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <PaginationItem>
                  <PaginationLink>...</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                // onClick={() =>
                //   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                // }
                className={
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage((prev) => prev + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
