import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DebtForm from '../components/debts/DebtForm';
import DebtItem from '../components/debts/DebtItem';
import DebtStats from '../components/debts/DebtStats';
import { FiPlus, FiFilter, FiSearch, FiChevronDown, FiChevronUp, FiEdit, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import config from '../config.json'; 

const Debt = () => {
  const { user, token } = useAuth();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    creditor: '',
    search: '',
    start_date: '',
    end_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Format currency for Kenyan Shillings
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    fetchDebts();
  }, [filters, token]);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${config.api_url}/debts?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch debts');
      }

      const data = await response.json();
      setDebts(data.debts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDebt = async (debtData) => {
    try {
      setError(null);
      const response = await fetch(`${config.api_url}/debts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(debtData)
      });

      if (!response.ok) {
        throw new Error('Failed to create debt');
      }

      const newDebt = await response.json();
      setDebts([newDebt.debt, ...debts]);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

const handleUpdateDebt = async (debtId, updatedData, onSuccess) => {
  try {
    setError(null);
    const response = await fetch(`${config.api_url}/debts/${debtId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Failed to update debt");
    }

    const updatedDebt = await response.json();
    setDebts(debts.map((debt) =>
      debt.id === debtId ? updatedDebt.debt : debt
    ));
    if (onSuccess) onSuccess(); 
  } catch (err) {
    setError(err.message);
  }
};

  const handleDeleteDebt = async (debtId) => {
    try {
      setError(null);
      const response = await fetch(`${config.api_url}/debts/${debtId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete debt');
      }

      setDebts(debts.filter(debt => debt.id !== debtId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      creditor: '',
      search: '',
      start_date: '',
      end_date: ''
    });
  };

  const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
  const paidDebt = debts
    .filter(debt => debt.status === 'paid')
    .reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
  const pendingDebt = debts
    .filter(debt => debt.status === 'pending')
    .reduce((sum, debt) => sum + parseFloat(debt.amount), 0);

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Debt Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <FiFilter className="mr-2" />
            Filters
            {showFilters ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
          </button>
          <button
            onClick={() => {
              setEditingDebt(null);
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Debt
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      <DebtStats 
        totalDebt={formatCurrency(totalDebt)}
        paidDebt={formatCurrency(paidDebt)}
        pendingDebt={formatCurrency(pendingDebt)}
        debtCount={debts.length}
      />

      <div className="bg-white rounded-lg shadow p-4">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search debts..."
              value={filters.search}
              onChange={handleFilterChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Debt List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {Object.values(filters).some(Boolean) 
              ? 'No debts match your filters'
              : 'You have no debts recorded yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="md:hidden space-y-4">
              {debts.map((debt) => (
                <div key={debt.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{debt.creditor}</h3>
                      <p className="text-sm text-gray-500">{debt.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{formatCurrency(debt.amount)}</span>
                      <div className="text-xs text-gray-500">
                        {format(new Date(debt.due_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      debt.status === 'paid' ? 'bg-green-100 text-green-800' :
                      debt.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {debt.status.replace('_', ' ')}
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditingDebt(debt);
                          setShowForm(true);
                        }}
                        className="text-teal-600 hover:text-teal-800"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteDebt(debt.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creditor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (KES)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {debts.map((debt) => (
                  <DebtItem
                    key={debt.id}
                    debt={debt}
                    onEdit={() => {
                      setEditingDebt(debt);
                      setShowForm(true);
                    }}
                    onDelete={() => handleDeleteDebt(debt.id)}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showForm || editingDebt) && (
<DebtForm
  debt={editingDebt}
  onSubmit={(debtData) => {
    if (editingDebt) {
      handleUpdateDebt(editingDebt.id, debtData, () => {
        setShowForm(false);
        setEditingDebt(null);
      });
    } else {
      handleCreateDebt(debtData);
      setShowForm(false);
    }
  }}
  onCancel={() => {
    setShowForm(false);
    setEditingDebt(null);
  }}
/>
      )}
    </div>
  );
};

export default Debt;