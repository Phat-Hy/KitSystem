import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Default to null (not logged in)
    const [error, setError] = useState(null); // Error state for login failures

    const login = (userData) => {
        if (userData) {
            setUser(userData); // Set user data upon successful login
            setError(null); // Clear any previous errors
        } else {
            setError("Login failed. Please try again."); // Set an error message if login fails
        }
    };

    const logout = () => {
        setUser(null); // Clear user data upon logout
        setError(null); // Clear errors on logout
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

// PropTypes validation for AuthProvider
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => {
    return useContext(AuthContext);
};
