import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext'; // Import the useAuth hook

const Profile = () => {
    const { user, setUser } = useAuth(); // Get the user from AuthContext
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [address, setAddress] = useState({
        streetAddress: user?.streetAddress || '',
        apartment: user?.apartment || '',
        city: user?.city || '',
        postcode: user?.postCode || ''
    });
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [visibleSection, setVisibleSection] = useState('profile');

    // Fetch orders when the component mounts
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`http://localhost:5138/api/Orders/${user.userId}`);
                const data = await response.json();
                setOrders(data.$values || []); // Assuming the response follows this structure
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        if (user) {
            fetchOrders();
        }
    }, [user]);

    // Validate password strength
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password);
    };

    // Handle profile update
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5138/api/UpdateAccount/${user.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    streetAddress: address.streetAddress,
                    apartment: address.apartment,
                    city: address.city,
                    postCode: address.postcode
                })
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Profile updated successfully!');
                setUser({ ...user, firstName, lastName, streetAddress: address.streetAddress, apartment: address.apartment, city: address.city, postCode: address.postcode });
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('An error occurred while updating the profile.');
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        setErrorMessage('');

        if (password !== confirmPassword) {
            setErrorMessage('New password and confirm password do not match.');
            return;
        }

        if (!validatePassword(password)) {
            setErrorMessage('Password must be at least 8 characters long, contain a lowercase letter, an uppercase letter, and a number.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5138/api/ChangePassword/${user.userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oldPassword, password })
            });
            if (response.ok) {
                setPasswordMessage('Password updated successfully!');
                setOldPassword('');
                setPassword('');
                setConfirmPassword('');
            } else {
                const data = await response.json();
                setPasswordMessage(`Error updating password: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating password:', error);
            setPasswordMessage('An error occurred while updating the password.');
        }
    };

    // Handle order cancellation
    const cancelOrder = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:5138/api/Orders/cancel/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.ordersId === orderId
                            ? { ...order, statusId: 4 }
                            : order
                    )
                );
                setMessage('Order cancelled successfully.');
            } else {
                setMessage('Failed to cancel the order.');
            }
        } catch (error) {
            console.error('Error canceling order:', error);
            setMessage('An error occurred while canceling the order.');
        }
    };

    return (
        <div className="profile-container">
            <h2>Profile</h2>

            {/* Navigation buttons */}
            <div className="profile-nav">
                <button onClick={() => setVisibleSection('profile')}>Account Details</button>
                <button onClick={() => setVisibleSection('orders')}>Order History</button>
                <button onClick={() => setVisibleSection('password')}>Change Password</button>
            </div>

            {/* Profile Information Section */}
            {visibleSection === 'profile' && (
                <section className="profile-info">
                    <form onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label>First Name:</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name:</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Street Address:</label>
                            <input
                                type="text"
                                value={address.streetAddress}
                                onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Apartment:</label>
                            <input
                                type="text"
                                value={address.apartment}
                                onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>City:</label>
                            <input
                                type="text"
                                value={address.city}
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Postcode:</label>
                            <input
                                type="text"
                                value={address.postcode}
                                onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit">Update Profile</button>
                    </form>
                    {message && <p>{message}</p>}
                </section>
            )}

            {/* Change Password Section */}
            {visibleSection === 'password' && (
                <section className="change-password">
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <label>Old Password:</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Change Password</button>
                    </form>
                    {passwordMessage && <p>{passwordMessage}</p>}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </section>
            )}

            {/* Order History Section */}
            {visibleSection === 'orders' && (
                <section className="order-history">
                    <ul>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <li key={order.ordersId}>
                                    <p>Order ID: {order.ordersId}</p>
                                    <p>Status: {order.statusLabel}</p>
                                    <p>Total Amount: {order.totalAmount}</p>
                                    {order.statusId === 1 && (
                                        <button onClick={() => cancelOrder(order.ordersId)}>
                                            Cancel Order
                                        </button>
                                    )}
                                </li>
                            ))
                        ) : (
                            <p>No orders found.</p>
                        )}
                    </ul>
                </section>
            )}
        </div>
    );
};
// Define PropTypes for the component
Profile.propTypes = {
    user: PropTypes.shape({
        userId: PropTypes.number.isRequired,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        streetAddress: PropTypes.string,
        apartment: PropTypes.string,
        city: PropTypes.string,
        postCode: PropTypes.string
    }).isRequired
};
export default Profile;
