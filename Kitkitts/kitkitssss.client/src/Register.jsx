import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ setUser }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const navigate = useNavigate();

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        if (!validatePassword(password)) {
            setErrorMessage(
                "Password must be at least 8 characters long, contain a lowercase letter, an uppercase letter, and a number."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5138/api/Register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                    roleId: 2, // Automatically set roleId to 2
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser({ // Update user state with registered user info
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                });
                setSuccessMessage(`Registration successful. Welcome, ${data.firstName} ${data.lastName}!`);
                setIsRegistered(true);
                // Clear form
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else if (response.status === 409) {
                setErrorMessage(data.message);
            } else {
                setErrorMessage(data.message || 'An error occurred during registration.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setErrorMessage('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {isRegistered ? (
                <div>
                    <p>{successMessage}</p>
                </div>
            ) : (
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="firstName">First Name:</label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name:</label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            )}
            <button onClick={handleGoHome}>Go to Home</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default Register;
