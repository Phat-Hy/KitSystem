import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './Login.css';
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { useAuth } from './AuthContext'; // Import useAuth to get login functionality

const Login = () => {
    const { login } = useAuth(); // Get login function from AuthContext
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Required'),
            password: Yup.string()
                .min(6, 'Password must be at least 6 characters')
                .required('Required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setMessage('');

            try {
                const response = await fetch('http://localhost:5138/api/Login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    setMessage(errorData.message || 'Invalid email or password.');
                    return;
                }

                const data = await response.json();
                console.log('Login response:', data);
                login({
                    userId: data.userId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    roleId: data.roleId,
                    email: data.email
                });

                // Implement remember me functionality
                if (values.rememberMe) {
                    localStorage.setItem('user', JSON.stringify(data));
                } else {
                    sessionStorage.setItem('user', JSON.stringify(data));
                }

                setMessage(`Welcome, ${data.firstName} ${data.lastName}!`);
                navigate('/');

            } catch (error) {
                console.error('Error during login:', error);
                setMessage('An error occurred during login. Please try again later.');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="container">
            <h1>Login</h1>
            <form onSubmit={formik.handleSubmit} className="form">
                <div className="group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        disabled={loading}
                    />
                    <FaUser />
                    {formik.touched.email && formik.errors.email ? (
                        <div className="error">{formik.errors.email}</div>
                    ) : null}
                </div>
                <div className="group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                        disabled={loading}
                    />
                    <RiLockPasswordFill />
                    {formik.touched.password && formik.errors.password ? (
                        <div className="error">{formik.errors.password}</div>
                    ) : null}
                </div>
                <div className='remember-forgot'>
                    <label>
                        <input
                            type="checkbox"
                            name="rememberMe"
                            onChange={formik.handleChange}
                            checked={formik.values.rememberMe}
                            disabled={loading}
                        /> Remember me
                    </label>
                    <a href='#'>Forgot Password?</a>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <div className="register">
                    <p>Dont have an account?
                        <a href="#">Register</a>
                    </p>
                </div>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default Login;