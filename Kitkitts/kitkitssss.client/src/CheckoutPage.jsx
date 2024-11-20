import React, { useEffect, useState } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext'; // Import the useAuth hook

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth(); // Get user info from AuthContext
    const [totalPrice, setTotalPrice] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [error, setError] = useState('');
    const [userInfo, setUserInfo] = useState({
        receiveName: '',
        receivePhone: '',
        streetAddress: '',
        companyName: '',
        apartment: '',
        city: '',
        postcode: '',
    });

    useEffect(() => {
        const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalPrice(total);
    }, [cartItems]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user && user.userId) {
                try {
                    const response = await fetch(`http://localhost:5138/api/users/${user.userId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch user information');
                    }
                    const userData = await response.json();
                    // Set user information including postcode
                    setUserInfo({
                        receiveName: `${userData.firstName} ${userData.lastName}`, // Combining first and last names
                        receivePhone: userData.phone,
                        streetAddress: userData.streetAddress,
                        companyName: userData.companyName,
                        apartment: userData.apartment, // Added apartment field
                        city: userData.city,
                        postcode: userData.postCode, // Correctly map the postCode from API
                    });
                } catch (error) {
                    console.error('Error fetching user information:', error);
                    setError('Unable to load user information. Please check your login status.');
                }
            }
        };
        fetchUserInfo();
    }, [user]); // Only run this effect when the user changes

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo({ ...userInfo, [name]: value });
    };

    const handleCheckout = async () => {
        // Check stock availability
        for (let item of cartItems) {
            if (item.quantity > item.quantityAvailable) {
                setError(`Requested quantity for ${item.kitName} exceeds available stock.`);
                return;
            }
        }

        // Prepare order data
        const orderData = {
            usersId: user ? user.userId : null, // Use user ID from AuthContext
            receiveName: userInfo.receiveName,
            receivePhoneNumbers: userInfo.receivePhone, // Use the correct phone number
            streetAddress: userInfo.streetAddress,
            companyName: userInfo.companyName,
            apartment: userInfo.apartment, // Include apartment
            city: userInfo.city,
            postcode: userInfo.postcode, // Use correct mapping for postcode
            totalAmount: totalPrice,
            paymentMethod,
            ordersItems: cartItems.map(item => ({
                kitId: item.kitId,
                quantity: item.quantity
            })), // Ensure correct mapping for ordersItems
        };

        // Log the order data
        console.log('Order Data:', JSON.stringify(orderData, null, 2));

        try {
            const response = await fetch('http://localhost:5138/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errorData = await response.text(); // Change this to text to read non-JSON response
                console.error('Server Error:', errorData); // Log the server error
                setError(errorData || 'Failed to place the order.');
                return;
            }

            const result = await response.json();
            console.log('Order placed successfully:', result);
            alert('Checkout successful! Your order has been placed.'); // Success message

            // Clear the cart after successful checkout
            clearCart();
        } catch (error) {
            console.error('Error during checkout:', error);
            setError('An error occurred during checkout. Please try again later.');
        }
    };

    return (
        <div>
            <h2>Checkout</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <h3>User Information</h3>
                <label>
                    Name:
                    <input
                        type="text"
                        name="receiveName"
                        value={userInfo.receiveName}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Phone:
                    <input
                        type="text"
                        name="receivePhone"
                        value={userInfo.receivePhone}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Street Address:
                    <input
                        type="text"
                        name="streetAddress"
                        value={userInfo.streetAddress}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Company Name:
                    <input
                        type="text"
                        name="companyName"
                        value={userInfo.companyName}
                        onChange={handleInputChange}
                    />
                </label>
                <label>
                    Apartment:
                    <input
                        type="text"
                        name="apartment"
                        value={userInfo.apartment}
                        onChange={handleInputChange}
                    />
                </label>
                <label>
                    City:
                    <input
                        type="text"
                        name="city"
                        value={userInfo.city}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Postcode:
                    <input
                        type="text"
                        name="postcode"
                        value={userInfo.postcode}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <h3>Total Amount: ${totalPrice.toFixed(2)}</h3>
                <h3>Payment Method</h3>
                <label>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                    />
                    Cash on Delivery
                </label>
                <label>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                    />
                    Online Payment
                </label>
                <button onClick={handleCheckout}>Place Order</button>
            </div>
        </div>
    );
};

export default CheckoutPage;
