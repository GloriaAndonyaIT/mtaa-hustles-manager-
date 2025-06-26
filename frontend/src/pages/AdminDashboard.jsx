import { useState, useEffect, useContext } from 'react';
import { useAuth } from "../components/context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CreditCardIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import config from "../config.json";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // State for all data
  const [users, setUsers] = useState([]);
  const [hustles, setHustles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  
  // State for filtered data
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredHustles, setFilteredHustles] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filteredDebts, setFilteredDebts] = useState([]);
  
  // State for stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalHustles: 0,
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalDebts: 0
  });
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [apiErrors, setApiErrors] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Check if user is admin on component mount
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      setSnackbar({
        open: true,
        message: 'Admin access required',
        severity: 'error'
      });
    } else {
      fetchAllData();
    }
  }, [isAdmin, navigate]);
  
  // Filter data when search term changes
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.username.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      ))
      setFilteredHustles(hustles.filter(h => 
        h.title.toLowerCase().includes(term) || 
        h.description.toLowerCase().includes(term)
      ))
      setFilteredTransactions(transactions.filter(t => 
        t.description.toLowerCase().includes(term) || 
        t.type.toLowerCase().includes(term)
      ))
      setFilteredDebts(debts.filter(d => 
        d.description.toLowerCase().includes(term) || 
        d.creditor.toLowerCase().includes(term)
      ));
    } else {
      setFilteredUsers(users);
      setFilteredHustles(hustles);
      setFilteredTransactions(transactions);
      setFilteredDebts(debts);
    }
  }, [searchTerm, users, hustles, transactions, debts]);
  
  // Fetch all data from API with improved error handling
const fetchAllData = async () => {
  try {
    setLoading(true);
    setApiErrors({});
    
    const token = localStorage.getItem('access_token');
    console.log('Current token:', token);
    if (!token) {
      navigate('/login');
      return;
    }

    const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json' // Explicitly request JSON
  };

    // Fetch users with improved error handling
    const usersResponse = await fetch(`${config.api_url}/admin/users`, { headers });
    
    // Check if response is HTML (error page)
    const contentType = usersResponse.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const errorText = await usersResponse.text();
      throw new Error(`Server returned HTML error page: ${usersResponse.status}`);
    }
    
    if (!usersResponse.ok) {
      // Try to parse as JSON first
      try {
        const errorData = await usersResponse.json();
        throw new Error(errorData.error || `Failed to fetch users: ${usersResponse.status}`);
      } catch (jsonError) {
        // Fall back to text if not JSON
        const errorText = await usersResponse.text();
        throw new Error(`Failed to fetch users: ${usersResponse.status} - ${errorText}`);
      }
    }
    
    const usersData = await usersResponse.json();
    setUsers(usersData);
    setFilteredUsers(usersData);

      try {
        // Fetch hustles
        const hustlesResponse = await fetch(`${config.api_url}/hustles`, { headers });
        if (!hustlesResponse.ok) {
          const errorText = await hustlesResponse.text();
          throw new Error(`Failed to fetch hustles: ${hustlesResponse.status} ${hustlesResponse.statusText} - ${errorText}`);
        }
        const hustlesData = await hustlesResponse.json();
        setHustles(hustlesData.hustles || []);
        setFilteredHustles(hustlesData.hustles || []);
      } catch (hustlesError) {
        console.error('Hustles fetch error:', hustlesError);
        setApiErrors(prev => ({ ...prev, hustles: hustlesError.message }));
      }

      try {
        // Fetch transactions
        const transactionsResponse = await fetch(`${config.api_url}/transactions`, { headers });
        if (!transactionsResponse.ok) {
          const errorText = await transactionsResponse.text();
          throw new Error(`Failed to fetch transactions: ${transactionsResponse.status} ${transactionsResponse.statusText} - ${errorText}`);
        }
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
        setFilteredTransactions(transactionsData.transactions || []);
      } catch (transactionsError) {
        console.error('Transactions fetch error:', transactionsError);
        setApiErrors(prev => ({ ...prev, transactions: transactionsError.message }));
      }

      try {
        // Fetch debts
        const debtsResponse = await fetch(`${config.api_url}/debts`, { headers });
        if (!debtsResponse.ok) {
          const errorText = await debtsResponse.text();
          throw new Error(`Failed to fetch debts: ${debtsResponse.status} ${debtsResponse.statusText} - ${errorText}`);
        }
        const debtsData = await debtsResponse.json();
        setDebts(debtsData.debts || []);
        setFilteredDebts(debtsData.debts || []);
      } catch (debtsError) {
        console.error('Debts fetch error:', debtsError);
        setApiErrors(prev => ({ ...prev, debts: debtsError.message }));
      }

      // Calculate stats with whatever data we have
      calculateStats(
        users,
        hustles,
        transactions,
        debts
      );

  } catch (error) {
    console.error('Main fetch error:', error);
    
    let errorMessage = 'Failed to fetch data';
    if (error.message.includes('403')) {
      errorMessage = 'Admin privileges required';
      navigate('/');
    } else if (error.message.includes('401')) {
      errorMessage = 'Session expired - please login again';
      navigate('/login');
    } else if (error.message.includes('500')) {
      errorMessage = 'Server error - please try again later';
    }

    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
    
  } finally {
    setLoading(false);
  }
};
  
  // Calculate statistics
  const calculateStats = (users, hustles, transactions, debts) => {
    try {
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => !u.is_suspended).length,
        totalHustles: hustles.length,
        totalTransactions: transactions.length,
        totalIncome,
        totalExpenses,
        totalDebts: debts.reduce((sum, d) => sum + d.amount, 0)
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };
  
  // Toggle user suspension status
  const toggleUserStatus = async (userId, isSuspended) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.api_url}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ is_suspended: !isSuspended })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        setSnackbar({
          open: true,
          message: `User ${isSuspended ? 'activated' : 'suspended'} successfully`,
          severity: 'success'
        });
        fetchAllData(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update user status',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a user
  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.api_url}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
        fetchAllData(); // Refresh data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete user',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // View user details
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setOpenUserDialog(true);
  };
  
  // Close user dialog
  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setSelectedUser(null);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Chart data for dashboard
  const usersChartData = {
    labels: ['Total Users', 'Active Users', 'Suspended Users'],
    datasets: [
      {
        label: 'Users',
        data: [stats.totalUsers, stats.activeUsers, stats.totalUsers - stats.activeUsers],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const transactionsChartData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        data: [stats.totalIncome, stats.totalExpenses],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const hustlesChartData = {
    labels: hustles.reduce((acc, h) => {
      if (!acc.includes(h.type)) {
        acc.push(h.type);
      }
      return acc;
    }, []),
    datasets: [
      {
        label: 'Hustles by Type',
        data: hustles.reduce((acc, h) => {
          const index = acc.findIndex(a => a.type === h.type);
          if (index >= 0) {
            acc[index].count++;
          } else {
            acc.push({ type: h.type, count: 1 });
          }
          return acc;
        }, []).map(item => item.count),
        backgroundColor: [
          'rgba(255, 159, 64, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 205, 86, 0.5)',
          'rgba(54, 162, 235, 0.5)'
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={fetchAllData}
              startIcon={<RefreshIcon />}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={logout}
            >
              Logout
            </Button>
          </Box>
        </Box>
        
        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Button
            variant={activeTab === 'dashboard' ? 'contained' : 'text'}
            onClick={() => setActiveTab('dashboard')}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === 'users' ? 'contained' : 'text'}
            onClick={() => setActiveTab('users')}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Users
          </Button>
          <Button
            variant={activeTab === 'hustles' ? 'contained' : 'text'}
            onClick={() => setActiveTab('hustles')}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Hustles
          </Button>
          <Button
            variant={activeTab === 'transactions' ? 'contained' : 'text'}
            onClick={() => setActiveTab('transactions')}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Transactions
          </Button>
          <Button
            variant={activeTab === 'debts' ? 'contained' : 'text'}
            onClick={() => setActiveTab('debts')}
            disabled={loading}
          >
            Debts
          </Button>
        </Box>
        
        {/* Error display for failed API calls */}
        {Object.keys(apiErrors).length > 0 && (
          <Box sx={{ mb: 3 }}>
            {Object.entries(apiErrors).map(([key, error]) => (
              <Alert severity="error" key={key} sx={{ mb: 1 }}>
                Failed to load {key}: {error}
              </Alert>
            ))}
            <Button 
              variant="outlined" 
              color="error" 
              onClick={fetchAllData}
              startIcon={<RefreshIcon />}
              size="small"
            >
              Retry Failed Requests
            </Button>
          </Box>
        )}
        
        {/* Search Bar */}
        {activeTab !== 'dashboard' && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />
              }}
              disabled={loading}
            />
          </Box>
        )}
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Grid container spacing={3}>
            {/* Stats Cards */}
            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center">
                  <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Total Users</Typography>
                    <Typography variant="h4">{stats.totalUsers}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center">
                  <WorkIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Total Hustles</Typography>
                    <Typography variant="h4">{stats.totalHustles}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center">
                  <MoneyIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Total Transactions</Typography>
                    <Typography variant="h4">{stats.totalTransactions}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" alignItems="center">
                  <CreditCardIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Total Debts</Typography>
                    <Typography variant="h4">${stats.totalDebts.toFixed(2)}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            {/* Charts */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Users Overview</Typography>
                <Box sx={{ height: 300 }}>
                  <Pie data={usersChartData} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Transactions Overview</Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={transactionsChartData} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Hustles by Type</Typography>
                <Box sx={{ height: 400 }}>
                  <Bar data={hustlesChartData} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            {loading && filteredUsers.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>Loading users...</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip 
                              label={user.is_suspended ? 'Suspended' : 'Active'} 
                              color={user.is_suspended ? 'error' : 'success'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.is_admin ? 'Yes' : 'No'} 
                              color={user.is_admin ? 'primary' : 'default'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="small" 
                              onClick={() => viewUserDetails(user)}
                              sx={{ mr: 1 }}
                              disabled={loading}
                            >
                              View
                            </Button>
                            <Button 
                              size="small" 
                              color={user.is_suspended ? 'success' : 'error'}
                              startIcon={user.is_suspended ? <CheckIcon /> : <BlockIcon />}
                              onClick={() => toggleUserStatus(user.id, user.is_suspended)}
                              sx={{ mr: 1 }}
                              disabled={loading}
                            >
                              {user.is_suspended ? 'Activate' : 'Suspend'}
                            </Button>
                            <Button 
                              size="small" 
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => deleteUser(user.id)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          {apiErrors.users ? 'Failed to load users' : 'No users found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
        
        {/* Hustles Tab */}
        {activeTab === 'hustles' && (
          <>
            {loading && filteredHustles.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>Loading hustles...</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredHustles.length > 0 ? (
                      filteredHustles.map((hustle) => (
                        <TableRow key={hustle.id}>
                          <TableCell>{hustle.id}</TableCell>
                          <TableCell>{hustle.title}</TableCell>
                          <TableCell>
                            <Chip label={hustle.type} size="small" />
                          </TableCell>
                          <TableCell>
                            {users.find(u => u.id === hustle.user_id)?.username || 'Unknown'}
                          </TableCell>
                          <TableCell>{new Date(hustle.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Typography noWrap sx={{ maxWidth: 200 }}>
                              {hustle.description}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          {apiErrors.hustles ? 'Failed to load hustles' : 'No hustles found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
        
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            {loading && filteredTransactions.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>Loading transactions...</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.type} 
                              color={transaction.type === 'income' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Typography noWrap sx={{ maxWidth: 200 }}>
                              {transaction.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {users.find(u => u.id === transaction.user_id)?.username || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          {apiErrors.transactions ? 'Failed to load transactions' : 'No transactions found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
        
        {/* Debts Tab */}
        {activeTab === 'debts' && (
          <>
            {loading && filteredDebts.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>Loading debts...</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Creditor</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDebts.length > 0 ? (
                      filteredDebts.map((debt) => (
                        <TableRow key={debt.id}>
                          <TableCell>{debt.id}</TableCell>
                          <TableCell>${debt.amount.toFixed(2)}</TableCell>
                          <TableCell>{debt.creditor}</TableCell>
                          <TableCell>
                            <Chip 
                              label={debt.status} 
                              color={
                                debt.status === 'paid' ? 'success' : 
                                debt.status === 'partially_paid' ? 'warning' : 'error'
                              } 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {users.find(u => u.id === debt.user_id)?.username || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {new Date(debt.due_date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          {apiErrors.debts ? 'Failed to load debts' : 'No debts found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Box>
      
      {/* User Details Dialog */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Username:</strong> {selectedUser.username}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Email:</strong> {selectedUser.email}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Status:</strong> 
                  <Chip 
                    label={selectedUser.is_suspended ? 'Suspended' : 'Active'} 
                    color={selectedUser.is_suspended ? 'error' : 'success'} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Admin:</strong> 
                  <Chip 
                    label={selectedUser.is_admin ? 'Yes' : 'No'} 
                    color={selectedUser.is_admin ? 'primary' : 'default'} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Total Hustles:</strong> {hustles.filter(h => h.user_id === selectedUser.id).length}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Total Transactions:</strong> {transactions.filter(t => t.user_id === selectedUser.id).length}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Total Debts:</strong> ${debts.filter(d => d.user_id === selectedUser.id).reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;