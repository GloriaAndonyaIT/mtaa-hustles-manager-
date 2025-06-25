import React from 'react';

const DebtStats = ({ totalDebt, paidDebt, pendingDebt, debtCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-teal-500">
        <h3 className="text-sm font-medium text-gray-500">Total Debt</h3>
        <p className="text-2xl font-semibold text-gray-900">{totalDebt}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
        <h3 className="text-sm font-medium text-gray-500">Paid</h3>
        <p className="text-2xl font-semibold text-gray-900">{paidDebt}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
        <p className="text-2xl font-semibold text-gray-900">{pendingDebt}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <h3 className="text-sm font-medium text-gray-500">Total Debts</h3>
        <p className="text-2xl font-semibold text-gray-900">{debtCount}</p>
      </div>
    </div>
  );
};

export default DebtStats;