import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../components/context/AuthContext";
import FormInput from '../auth/FormInput';
import FormButton from '../auth/FormButton';
import ErrorMessage from '../auth/ErrorMessage';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Invalid username or password');
      }

      // Store the token and user data
      const success = await login(data.access_token);
      if (success) {
        navigate(data.user?.is_admin ? '/admin/dashboard' : '/dashboard');
      } else {
        setError('Failed to initialize user session');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <ErrorMessage error={error} />

      <div className="space-y-4">
        <FormInput
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          required
        />

        <FormInput
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />

        <FormButton 
          type="submit" 
          isLoading={isLoading}
          disabled={!formData.username || !formData.password || isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </FormButton>
      </div>
    </form>
  );
};

export default LoginForm;