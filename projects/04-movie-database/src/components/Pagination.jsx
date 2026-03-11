import ReactPaginate from 'react-paginate'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  function handlePageClick({ selected }) {
    onPageChange(selected + 1)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center">
      <ReactPaginate
        pageCount={Math.min(totalPages, 500)}
        pageRangeDisplayed={3}
        marginPagesDisplayed={1}
        forcePage={currentPage - 1}
        onPageChange={handlePageClick}
        containerClassName="flex items-center gap-1 flex-wrap justify-center"
        pageClassName="block"
        pageLinkClassName="block px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-yellow-500/20 hover:text-yellow-400 border border-slate-700 hover:border-yellow-500/50 transition-colors text-sm font-medium"
        activeClassName="!block"
        activeLinkClassName="!bg-yellow-500 !text-slate-900 !border-yellow-500"
        previousClassName="block"
        previousLinkClassName="block px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors text-sm font-medium"
        nextClassName="block"
        nextLinkClassName="block px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors text-sm font-medium"
        breakClassName="block"
        breakLinkClassName="block px-3 py-1.5 text-slate-500"
        disabledClassName="opacity-40 cursor-not-allowed"
        previousLabel="← Prev"
        nextLabel="Next →"
      />
    </div>
  )
}
