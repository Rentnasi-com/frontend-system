const Modal = ({ title, message, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4">{title}</h2>
            <p className="text-gray-700 mb-4">{message}</p>
            <div className="flex justify-end gap-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);

export default Modal;
