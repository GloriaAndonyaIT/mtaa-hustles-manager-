import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from "../components/context/AuthContext";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import config from '../config.json';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const { user, token, isAdmin, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [hustles, setHustles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAdminData = async () => {
    try {
     
      const verifyResponse = await fetch(`${config.api_url}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Session expired - please login again');
      }

     
      const usersResponse = await fetch(`${config.api_url}/admin/users`, { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!usersResponse.ok) {
        const errorData = await usersResponse.json().catch(() => ({}));
        const errorMessage = errorData.error || 
                           errorData.message || 
                           `Server responded with ${usersResponse.status}`;
        throw new Error(errorMessage);
      }

      const usersData = await usersResponse.json();
      return usersData;
      
    } catch (error) {
      console.error('Admin data fetch error:', error);
      throw error;
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const usersData = await fetchAdminData();
      
     
      const [hustlesRes, transactionsRes, debtsRes] = await Promise.all([
        fetch(`${config.api_url}/hustles`, { headers }),
        fetch(`${config.api_url}/transactions`, { headers }),
        fetch(`${config.api_url}/debts`, { headers })
      ]);

    
      if (!hustlesRes.ok) throw new Error('Failed to fetch hustles');
      if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');
      if (!debtsRes.ok) throw new Error('Failed to fetch debts');

      
      const [hustlesData, transactionsData, debtsData] = await Promise.all([
        hustlesRes.json(),
        transactionsRes.json(),
        debtsRes.json()
      ]);

      setUsers(usersData);
      setHustles(hustlesData.hustles || []);
      setTransactions(transactionsData.transactions || []);
      setDebts(debtsData.debts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      if (err.message.includes('Session expired')) {
        logout();
      }
      setSnackbar({ 
        open: true, 
        message: `Failed to load data: ${err.message}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setError('Access Denied: Admin privileges required');
      setLoading(false);
      return;
    }
    fetchAllData();
  }, [isAdmin, token]);

  const toggleUserStatus = async (userId, isSuspended) => {
    try {
      const response = await fetch(`${config.api_url}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_suspended: !isSuspended })
      });

      if (!response.ok) throw new Error('Failed to update user status');

      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_suspended: !isSuspended } : user
      ));
      setSnackbar({ open: true, message: 'User status updated', severity: 'success' });
    } catch (err) {
      console.error('Error updating user status:', err);
      setSnackbar({ open: true, message: 'Failed to update user status', severity: 'error' });
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${config.api_url}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(users.filter(user => user.id !== userId));
      setSnackbar({ open: true, message: 'User deleted', severity: 'success' });
    } catch (err) {
      console.error('Error deleting user:', err);
      setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' });
    }
  };

  // Process data for charts
  const getHustleTypeData = () => {
    const typeCounts = {};
    hustles.forEach(hustle => {
      typeCounts[hustle.type] = (typeCounts[hustle.type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  };

  const getTransactionTypeData = () => {
    const income = transactions.filter(t => t.type === 'income').length;
    const expense = transactions.filter(t => t.type === 'expense').length;
    return [
      { name: 'Income', value: income },
      { name: 'Expense', value: expense }
    ];
  };

  const getDebtStatusData = () => {
    const statusCounts = {};
    debts.forEach(debt => {
      statusCounts[debt.status] = (statusCounts[debt.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const getFinancialOverview = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalDebt = debts
      .filter(d => d.status !== 'paid')
      .reduce((sum, d) => sum + parseFloat(d.amount), 0);
    
    return [
      { name: 'Income', amount: totalIncome },
      { name: 'Expense', amount: totalExpense },
      { name: 'Outstanding Debt', amount: totalDebt },
      { name: 'Net', amount: totalIncome - totalExpense }
    ];
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!isAdmin) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h4" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" color="error" gutterBottom>
          Error Loading Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={fetchAllData}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'green.100', height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{users.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'green.200', height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Total Hustles</Typography>
              <Typography variant="h4">{hustles.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'green.300', height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Total Transactions</Typography>
              <Typography variant="h4">{transactions.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'green.400', height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Total Debts</Typography>
              <Typography variant="h4">{debts.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts Row 1 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Hustle Types Distribution</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={getHustleTypeData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {getHustleTypeData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Transaction Types</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={getTransactionTypeData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {getTransactionTypeData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Charts Row 2 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Financial Overview (KSh)</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={getFinancialOverview()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `KSh ${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="amount" fill="#4CAF50" name="Amount (KSh)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Debt Status</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={getDebtStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {getDebtStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Users Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>User Management</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{user.is_suspended ? 'Suspended' : 'Active'}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color={user.is_suspended ? 'success' : 'warning'}
                          size="small"
                          onClick={() => toggleUserStatus(user.id, user.is_suspended)}
                          sx={{ mr: 1 }}
                        >
                          {user.is_suspended ? 'Activate' : 'Suspend'}
                        </Button>
                        {!user.is_admin && (
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Amount (KSh)</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.slice(0, 5).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{parseFloat(tx.amount).toLocaleString()}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{tx.type}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Debts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Debts</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Amount (KSh)</TableCell>
                    <TableCell>Creditor</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {debts.slice(0, 5).map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell>{parseFloat(debt.amount).toLocaleString()}</TableCell>
                      <TableCell>{debt.creditor}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{debt.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;