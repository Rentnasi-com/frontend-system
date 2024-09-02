const TodoList = () => (
    <div className="bg-white rounded p-2 space-y-2">
        <h2 className="text-sm font-semibold">My Todo list</h2>
        <div className="flex justify-between border border-gray-200 rounded p-2">
            <div className="flex justify-center items-center">
                <div className="rounded-full bg-red-700 p-1 w-1"></div>
            </div>
            <div>
                <p className="text-sm font-medium">Renew Tenancy</p>
                <p className="text-xs">Checking Simon Kamau tenancy agreement</p>
            </div>
            <div className="space-y-1">
                <p className="text-xs">June 22 at 6:00 PM</p>
                <p className="flex text-xs">Done</p>
            </div>
        </div>
    </div>
);

export default TodoList