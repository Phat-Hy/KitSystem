// CartPage.jsx
import React from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const CartPage = () => {
    const { cartItems, removeItem, updateQuantity } = useCart();
    const navigate = useNavigate(); // Create a navigate function

    const handleCheckout = () => {
        navigate('/checkout'); // Navigate to the Checkout page
    };

    return (
        <div>
            <h2>Your Cart</h2>
            <ul>
                {cartItems.map(item => (
                    <li key={item.kitId}>
                        <span>{item.kitName}</span>
                        <span>Price: {item.price} VND</span>
                        <span>
                            Quantity:
                            <input
                                type="number"
                                value={item.quantity}
                                min="1"
                                onChange={(e) => updateQuantity(item.kitId, parseInt(e.target.value))}
                            />
                        </span>
                        <span>Remaining Support Sessions: {item.supportCount}</span> {/* Display support count */}
                        <button onClick={() => removeItem(item.kitId)}>Remove</button>
                    </li>
                ))}
            </ul>
            <button onClick={handleCheckout}>Checkout</button> {/* Checkout button */}
        </div>
    );
};

export default CartPage;
