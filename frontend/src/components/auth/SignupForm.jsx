import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import FormInput from '../auth/FormInput';
import FormButton from '../auth/FormButton';
import ErrorMessage from '../auth/ErrorMessage';
import config from "../../config.json"; 

const SignupForm = () => {
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    isAdmin: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
const response = await fetch(`${config.api_url}/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    username: `${formData.firstName} ${formData.lastName}`,
    email: formData.email,
    password: formData.password,
    is_admin: formData.isAdmin
  })
});

      const data = await response.json();

      if (response.ok) {
        await login(data.access_token);
        navigate(data.user.is_admin ? '/admin/dashboard' : '/dashboard');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && 
                     formData.password && formData.confirmPassword;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <ErrorMessage error={error} />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
          />

          <FormInput
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
        </div>

        <FormInput
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
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

        <FormInput
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
        />

        <div className="flex items-center">
          <input
            id="isAdmin"
            name="isAdmin"
            type="checkbox"
            checked={formData.isAdmin}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
            Register as admin
          </label>
        </div>

        <FormButton 
          type="submit" 
          isLoading={isLoading}
          disabled={!isFormValid}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </FormButton>
      </div>
    </form>
  );
};

export default SignupForm;
