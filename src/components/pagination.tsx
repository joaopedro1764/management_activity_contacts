import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    startIndex: number;
    getVisiblePageNumbers: () => number[];
    goToFirstPage: () => void;
    goToPreviousPage: () => void;
    goToPage: (page: number) => void;
    goToNextPage: () => void;
    goToLastPage: () => void;
}

export function Pagination({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    startIndex,
    getVisiblePageNumbers,
    goToFirstPage,
    goToPreviousPage,
    goToPage,
    goToNextPage,
    goToLastPage,
}: PaginationProps) {

    console.log(totalItems)
    return (
        <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-2">
                {
                    totalItems !== 0 && (
                        <span className="text-sm font-bold text-cyan-600">
                            Mostrando {startIndex + 1} a{" "}
                            {Math.min(startIndex + itemsPerPage, totalItems)} de {totalItems} resultados
                        </span>
                    )
                }
            </div>

            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-cyan-300 text-sm font-medium hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Primeira página"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>

                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-cyan-300 text-sm font-medium hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Página anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {currentPage > 3 && (
                        <>
                            <button
                                onClick={() => goToPage(1)}
                                className="px-3 py-2 rounded-md border border-cyan-300 text-sm font-medium hover:bg-cyan-50"
                            >
                                1
                            </button>
                            {currentPage > 4 && (
                                <span className="px-2 py-2 text-sm text-cyan-500">...</span>
                            )}
                        </>
                    )}

                    {getVisiblePageNumbers().map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            className={`px-3 py-2 rounded-md border text-sm font-medium ${pageNumber === currentPage
                                ? "bg-cyan-600 text-white border-cyan-600"
                                : "border-cyan-300 hover:bg-cyan-50"
                                }`}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    {currentPage < totalPages - 2 && (
                        <>
                            {currentPage < totalPages - 3 && (
                                <span className="px-2 py-2 text-sm text-cyan-500">...</span>
                            )}
                            <button
                                onClick={() => goToPage(totalPages)}
                                className="px-3 py-2 rounded-md border border-cyan-300 text-sm font-medium hover:bg-cyan-50"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-cyan-300 text-sm font-medium hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Próxima página"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-cyan-300 text-sm font-medium hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Última página"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
