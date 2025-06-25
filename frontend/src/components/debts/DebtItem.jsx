import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';

const DebtItem = ({ debt, onEdit, onDelete, formatCurrency }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{debt.creditor}</div>
        <div className="text-sm text-gray-500">{debt.description}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-900 font-medium">
          {formatCurrency(debt.amount)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-900">
          {format(new Date(debt.due_date), 'MMM dd, yyyy')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          debt.status === 'paid' ? 'bg-green-100 text-green-800' :
          debt.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {debt.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={onEdit}
          className="text-teal-600 hover:text-teal-900 mr-4"
          aria-label="Edit"
        >
          <FiEdit />
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-900"
          aria-label="Delete"
        >
          <FiTrash2 />
        </button>
      </td>
    </tr>
  );
};

export default DebtItem;