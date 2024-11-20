// CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create CartContext
const CartContext = createContext();

// Create a provider for the cart
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [kits, setKits] = useState([]); // State to hold available kits

    // Fetch available kits from API
    useEffect(() => {
        const fetchKits = async () => {
            try {
                const response = await fetch('http://localhost:5138/api/Kits');
                const data = await response.json();
                setKits(data); // Set the available kits in state
            } catch (error) {
                console.error('Error fetching kits:', error);
            }
        };

        fetchKits();
    }, []);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(item => item.kitId === product.kitId);
            if (existingItem) {
                return prevItems.map(item =>
                    item.kitId === product.kitId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1, supportCount: 3 }]; // Set initial support count to 3
        });
    };

    const removeItem = (kitId) => {
        setCartItems(prevItems => prevItems.filter(item => item.kitId !== kitId));
    };

    const updateQuantity = (kitId, newQuantity) => {
        const kit = kits.find(item => item.kitId === kitId);
        if (kit && newQuantity > kit.quantity) {
            alert(`Cannot exceed available stock of ${kit.quantity} for ${kit.kitName}.`); // Notify user
            return; // Stop the update if the new quantity exceeds available stock
        }

        setCartItems(prevItems => {
            return prevItems
                .map(item =>
                    item.kitId === kitId ? { ...item, quantity: newQuantity } : item
                )
                .filter(item => item.quantity > 0);
        });
    };

    // New function to clear the cart
    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeItem, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

// Define prop types for CartProvider
CartProvider.propTypes = {
    children: PropTypes.node.isRequired, // Validate that children is required and is a node
};

// Create a custom hook to use the CartContext
export const useCart = () => {
    return useContext(CartContext);
};
