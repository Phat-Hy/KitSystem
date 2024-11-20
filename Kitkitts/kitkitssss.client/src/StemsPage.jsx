import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext'; // Assuming useAuth provides user context
import { useNavigate } from 'react-router-dom';
import './App.css';

function StemsPage() {
    const [stems, setStems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('nameAsc');
    const { addToCart } = useCart();
    const { user } = useAuth(); // Get the user from context
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            await populateStemData();
            setLoading(false);
        };
        fetchData();
    }, []);

    const populateStemData = async () => {
        try {
            const response = await fetch('http://localhost:5138/api/Kits');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data && Array.isArray(data.$values)) {
                setStems(data.$values);
            } else {
                setStems([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setStems([]);
        }
    };

    const handleSort = (stems) => {
        const sortedStems = [...stems];
        switch (sortOption) {
            case 'nameAsc':
                return sortedStems.sort((a, b) => a.kitName.localeCompare(b.kitName));
            case 'nameDesc':
                return sortedStems.sort((a, b) => b.kitName.localeCompare(a.kitName));
            case 'priceLowToHigh':
                return sortedStems.sort((a, b) => a.price - b.price);
            case 'priceHighToLow':
                return sortedStems.sort((a, b) => b.price - a.price);
            default:
                return sortedStems;
        }
    };

    const filteredStems = handleSort(
        stems.filter(stem =>
            stem.kitName.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleAddToCart = (stem) => {
        if (!user) {
            alert('Please log in to add items to the cart.');
            navigate('/login');
        } else if (user.roleId === undefined) { // Check for undefined
            alert('Role ID is not set.'); // Debug message
        } else if (user.roleId !== 2) {
            alert('Only members can add items to the cart.');
        } else {
            addToCart(stem);
            alert(`${stem.kitName} has been added to your cart.`);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1 id="tableLabel">Stem Page</h1>
            <p>This component demonstrates fetching STEM data from the server.</p>

            <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="nameAsc">Name A-Z</option>
                <option value="nameDesc">Name Z-A</option>
                <option value="priceLowToHigh">Price Low to High</option>
                <option value="priceHighToLow">Price High to Low</option>
            </select>

            {filteredStems.length === 0
                ? <p><em>No results found.</em></p>
                : (
                    <table className="table table-striped" aria-labelledby="tableLabel">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Add to Cart</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStems.map(stem => (
                                <tr key={stem.kitId}>
                                    <td>
                                        {stem.kitImage && (
                                            <img
                                                src={`data:image/png;base64,${stem.kitImage}`}
                                                alt={stem.kitName}
                                                style={{ width: '100px', height: '100px' }}
                                            />
                                        )}
                                    </td>
                                    <td>{stem.kitName}</td>
                                    <td>{stem.description}</td>
                                    <td>${stem.price.toFixed(2)}</td>
                                    <td>
                                        <button onClick={() => handleAddToCart(stem)}>Add to Cart</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
        </div>
    );
}

// PropTypes validation (optional)
StemsPage.propTypes = {
    user: PropTypes.shape({
        roleId: PropTypes.number
    })
};

export default StemsPage;
