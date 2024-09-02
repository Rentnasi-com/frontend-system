const Pagination = ({ currentPage, totalPages, handlePageChange }) => (
    <div className="flex justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg ${
          currentPage === 1 ? "bg-gray-200" : "bg-blue-500 text-white"
        }`}
      >
        &laquo; Previous
      </button>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg ${
          currentPage === totalPages ? "bg-gray-200" : "bg-blue-500 text-white"
        }`}
      >
        Next &raquo;
      </button>
    </div>
  );
export default Pagination