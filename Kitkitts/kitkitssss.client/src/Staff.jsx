import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Staff = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState('');

    // Fetch all orders when the component mounts
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:5138/api/Orders');
                const data = await response.json();
                console.log('Fetched Orders:', data);
                setOrders(data.$values || []);  // Assuming $values contains the orders
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    // Handle order status update
    const updateOrderStatus = async (orderId, statusId) => {
        try {
            const response = await fetch(`http://localhost:5138/api/Orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ statusId })
            });
            if (response.ok) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.ordersId === orderId
                            ? { ...order, statusId }
                            : order
                    )
                );
                setMessage(`Order ${orderId} status updated successfully.`);
            } else {
                setMessage(`Failed to update status for order ${orderId}.`);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            setMessage('An error occurred while updating the order status.');
        }
    };

    const getStatusLabel = (statusId) => {
        switch (statusId) {
            case 1: return 'Pending';
            case 2: return 'Shipping';
            case 3: return 'Delivered';
            case 4: return 'Canceled';
            default: return 'Unknown';
        }
    };

    return (
        <div className="staff-container">
            <h2>Staff Dashboard</h2>

            <section className="order-management">
                <h3>Order Management</h3>

                {orders.length > 0 ? (
                    <table border="1">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={order.ordersId}>
                                    <td>{index + 1}</td>
                                    <td>{order.ordersId}</td>
                                    <td>{new Date(order.ordersDate).toLocaleDateString()}</td>
                                    <td>${order.totalAmount.toFixed(2)}</td>
                                    <td>{getStatusLabel(order.statusId)}</td>
                                    <td>
                                        {order.statusId == 1 && (
                                            <button onClick={() => updateOrderStatus(order.ordersId, 2)}>
                                                Mark as Shipping
                                            </button>
                                        )}
                                        {order.statusId == 2 && (
                                            <button onClick={() => updateOrderStatus(order.ordersId, 3)}>
                                                Mark as Delivered
                                            </button>
                                        )}
                                        {order.statusId == 1 && (
                                            <button onClick={() => updateOrderStatus(order.ordersId, 4)}>
                                                Mark as Canceled
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No orders found.</p>
                )}
                {message && <p>{message}</p>}
            </section>
        </div>
    );
};

Staff.propTypes = {
    user: PropTypes.shape({
        userId: PropTypes.number.isRequired,
        firstName: PropTypes.string,
        lastName: PropTypes.string
    }).isRequired
};

export default Staff;
