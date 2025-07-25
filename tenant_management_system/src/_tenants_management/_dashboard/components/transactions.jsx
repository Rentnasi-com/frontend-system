const TransactionItem = ({ description, date, status, transactionId }) => (
    <div className="flex space-x-2 items-center">
      <div className="flex justify-center items-center">
        <img width={16} height={16} src="/assets/icons/png/tick.png" alt="" />
      </div>
      <div className="space-y-1">
        <p className="text-xs">{description}</p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold">{status}</p>
        <p className="text-xs text-gray-400">{transactionId}</p>
      </div>
    </div>
  );

export default TransactionItem