import { FaEdit, FaEye, FaTrash } from "react-icons/fa"
import { Link } from "react-router-dom"
import { Button } from "../../components"


const TableRow = ({ index, datePaid, itemPaidFor, amountPaid, inquiryDescription, propertyName, unitNo, unitType, taskCare, phone_no, rentAmount, inquiryCategory, additionalCharges, overdueDate, roomStatus, inquiryPriority, inquiryStatus, actions, photo, tenantName, dueDate, fines, balance, rowTotal, rentStatus, eyeLink, isShowingActions, isShowingButtons }) => {
    return (
        <>
            <tr key={index} className="border-b text-sm">
                {photo && (
                    <td className="px-4 py-2">
                        <img src={photo} alt={name} className="w-12 h-12 rounded-full" />
                    </td>
                )}
                {inquiryDescription && (
                    <td className="px-4 py-2">{inquiryDescription}</td>
                )}
                {datePaid && (
                    <td className="px-4 py-2">{datePaid}</td>
                )}
                {itemPaidFor && (
                    <td className="px-4 py-2">{itemPaidFor}</td>
                )}
                {amountPaid && (
                    <td className="px-4 py-2">{amountPaid}</td>
                )}
                
                {tenantName && (
                    <td className="px-4 py-2">{tenantName}</td>
                )}
                {propertyName && (
                    <td className="px-4 py-2">{propertyName}</td>
                )}


                {unitNo && (
                    <td className="px-4 py-2">{unitNo}</td>
                )}
                {unitType && (
                    <td className="px-4 py-2">{unitType}</td>
                )}

                {taskCare && (
                    <td className="px-4 py-2">{taskCare}</td>
                )}
                {phone_no && (
                    <td className="px-4 py-2">{phone_no}</td>
                )}

                {rentAmount && (
                    <td className="px-4 py-2">{rentAmount}</td>
                )}
                {inquiryCategory && (
                    <td className="px-4 py-2">{inquiryCategory}</td>
                )}
                {additionalCharges && (
                    <td className="px-4 py-2">{additionalCharges}</td>
                )}

                {dueDate && (
                    <td className="px-4 py-2">{dueDate}</td>
                )}
                {fines && (
                    <td className="px-4 py-2">{fines}</td>
                )}
                {balance && (
                    <td className="px-4 py-2">{balance}</td>
                )}
                {rowTotal && (
                    <td className="px-4 py-2">{rowTotal}</td>
                )}
                {overdueDate && (
                    <td className="px-4 py-2">{overdueDate}</td>
                )}
                {roomStatus && (
                    <td className="px-4 py-2">
                        <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">{roomStatus}</span>
                    </td>
                )}
                {inquiryPriority && (
                    <td className="px-4 py-2">
                        <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">{inquiryPriority}</span>
                    </td>
                )}
                {inquiryStatus && (
                    <td className="px-4 py-2">
                        <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">{inquiryStatus}</span>
                    </td>
                )}

                {rentStatus && (
                    <td className="px-4 py-2">
                        <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">{rentStatus}</span>
                    </td>
                )}

                {actions && (
                    <td className="px-4 py-2">
                        <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">{actions}</span>
                    </td>
                )}

                {isShowingActions && (
                    <td className="px-4 py-2 flex space-x-4">
                        <Link to={eyeLink}><FaEye className="text-gray-500 hover:text-gray-700 cursor-pointer" /></Link>
                        <FaEdit className="text-purple-500 hover:text-purple-700 cursor-pointer" />
                        <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" />
                        {isShowingButtons && (
                            <>
                                <Link className="px-3 py-1 text-xs font-medium text-white bg-red-800 rounded hover:bg-red-900" to="/tenants/add-personal-details">Add Tenant</Link>
                                <Link to="" className="px-3 py-1 text-xs font-medium text-white bg-green-800 rounded hover:bg-green-900">Market Unit</Link>
                            </>
                        )}
                    </td>
                )}
            </tr>
        </>
    )
}

export default TableRow