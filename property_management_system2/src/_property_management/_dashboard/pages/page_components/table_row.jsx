import { FaEdit, FaEye, FaTrash } from "react-icons/fa"
import { Link } from "react-router-dom"


const TableRow = ({ index, title, unit, type, floor, tenant, phone_no, arrears, date_vacated, date, item, amount, monthly_rent, additional_charges, due_date, fines, balance, total, overdue_date, status, payment_date, actions, responsible, category, priority, photo, name, vacant_units, occupied, openIssues, expectedRevenue, outstandingRevenue, pendingBalances, eyeLink, isShowing, eyeEdit, isShowingButtons, addMarketUnitLink, addTenantLink, isInMarket }) => {
    return (
        <>
            <tr key={index} className="border-b text-sm">
                {photo && (
                    <td className="px-4 py-2">
                        <img src={photo} alt={name} className="w-12 h-12 rounded-full" />
                    </td>
                )}
                {tenant && (
                    <td className="px-4 py-2">{tenant}</td>
                )}



                {title && (
                    <td className="px-4 py-2">{title}</td>
                )}

                {unit && (
                    <td className="px-4 py-2">{unit}</td>
                )}
                {type && (
                    <td className="px-4 py-2">{type}</td>
                )}
                {floor && (
                    <td className="px-4 py-2">{floor}</td>
                )}

                {phone_no && (
                    <td className="px-4 py-2">{phone_no}</td>
                )}
                {arrears && (
                    <td className="px-4 py-2">{arrears}</td>
                )}
                {date_vacated && (
                    <td className="px-4 py-2">{date_vacated}</td>
                )}
                {date && (
                    <td className="px-4 py-2">{date}</td>
                )}
                {item && (
                    <td className="px-4 py-2">{item}</td>
                )}
                {amount && (
                    <td className="px-4 py-2">{amount}</td>
                )}
                {monthly_rent && (
                    <td className="px-4 py-2">{monthly_rent}</td>
                )}
                {additional_charges && (
                    <td className="px-4 py-2">{additional_charges}</td>
                )}
                {due_date && (
                    <td className="px-4 py-2">{due_date}</td>
                )}
                {fines && (
                    <td className="px-4 py-2">{fines}</td>
                )}
                {balance && (
                    <td className="px-4 py-2">{balance}</td>
                )}
                {total && (
                    <td className="px-4 py-2">{total}</td>
                )}
                {overdue_date && (
                    <td className="px-4 py-2">{overdue_date}</td>
                )}
                {responsible && (
                    <td className="px-4 py-2">{responsible}</td>
                )}
                {category && (
                    <td className="px-4 py-2">{category}</td>
                )}
                {priority && (
                    <td className="px-4 py-2">
                        <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">{priority}</span>
                    </td>
                )}
                {status && (
                    <td className="px-4 py-2">
                        <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">{status}</span>
                    </td>
                )}


                {vacant_units && (
                    <td className="px-4 py-2">{vacant_units}</td>
                )}
                {payment_date && (
                    <td className="px-4 py-2">{payment_date}</td>
                )}
                {actions && (
                    <td className="px-4 py-2">
                        <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">{actions}</span>
                    </td>
                )}
                {occupied && (
                    <td className="px-4 py-2">{occupied}</td>
                )}

                {openIssues && (
                    <td className="px-4 py-2">
                        <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">{openIssues}</span>
                    </td>
                )}

                {expectedRevenue && (
                    <td className="px-4 py-2">
                        <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">{expectedRevenue}</span>
                    </td>
                )}

                {outstandingRevenue && (
                    <td className="px-4 py-2">
                        <span className="bg-blue-100 border border-blue-400 text-blue-600 px-2 py-1 rounded">{outstandingRevenue}</span>
                    </td>
                )}
                {pendingBalances && (
                    <td className="px-4 py-2">
                        <span className="bg-blue-100 border border-blue-400 text-blue-600 px-2 py-1 rounded">{pendingBalances}</span>
                    </td>
                )}
                {isShowing && (
                    <td className="px-4 py-2 flex space-x-4">
                        <Link to={eyeLink}>
                            <FaEye className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                        </Link>
                        <Link to={eyeEdit}><FaEdit className="text-purple-500 hover:text-purple-700 cursor-pointer" /></Link>
                        <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" />

                        {isShowingButtons && (
                            <>
                                <Link to={addTenantLink} className="px-3 py-1 text-xs font-medium text-white bg-red-800 rounded hover:bg-red-900">Add Tenant</Link>
                                {isInMarket ? (
                                    <Link className="px-3 py-1 text-xs font-medium text-white bg-cyan-800 rounded hover:bg-cyan-900">Marketed Unit</Link>
                                ) :
                                    <Link to={addMarketUnitLink} className="px-3 py-1 text-xs font-medium text-white bg-green-800 rounded hover:bg-green-900">Market Unit</Link>
                                }
                            </>
                        )}
                    </td>
                )}

            </tr>
        </>
    )
}

export default TableRow