const ActivityItem = ({ description, date, status, }) => (
  <div className="flex justify-between items-center">
    <div className="flex justify-center items-center">
      <img className="bg-green-600 p-1 rounded-full" width={24} height={24} src="/assets/icons/png/user.png" alt="" />
      <div className="space-y-1 mx-4">
        <p className="text-xs">{description}</p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-xs font-semibold">{status}</p>
    </div>
  </div>
);

export default ActivityItem