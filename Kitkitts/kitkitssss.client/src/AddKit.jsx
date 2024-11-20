import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AddKit = () => {
    const [kit, setKit] = useState({
        kitName: '',
        categoryId: '',
        quantity: 0,
        price: 0,
        description: ''
    });
    const [image, setImage] = useState(null);
    const [labFile, setLabFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5138/api/Categories'); // Adjust the endpoint as needed
                setCategories(response.data.$values); // Correctly access the categories array
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setKit(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCategoryChange = (e) => {
        setKit(prevState => ({
            ...prevState,
            categoryId: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', image);
        formData.append('labFile', labFile);
        formData.append('kitName', kit.kitName);
        formData.append('categoryId', kit.categoryId);
        formData.append('quantity', kit.quantity);
        formData.append('price', kit.price);
        formData.append('description', kit.description);

        try {
            const response = await axios.post('http://localhost:5138/api/Kits', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Kit added:', response.data);
            // Reset the form after successful submission
            setKit({
                kitName: '',
                categoryId: '',
                quantity: 0,
                price: 0,
                description: ''
            });
            setImage(null);
            setLabFile(null);
            setNewCategory('');
        } catch (error) {
            const errorMessage = error.response?.data || 'An error occurred. Please try again.';
            console.error('Error adding kit:', errorMessage);
            alert(errorMessage); // Display error to the user
        }
    };

    const handleAddCategory = async () => {
        if (newCategory.trim() === '') return;

        try {
            const response = await axios.post('http://localhost:5138/api/Categories', { name: newCategory });
            setCategories(prevCategories => [...prevCategories, response.data]);
            setNewCategory('');
            alert('Category added successfully!');
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category.');
        }
    };

    return (
        <div>
            <h1>Add New Kit</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="kitName"
                    value={kit.kitName}
                    onChange={handleChange}
                    placeholder="Kit Name"
                    required
                />
                <select
                    name="categoryId"
                    value={kit.categoryId}
                    onChange={handleCategoryChange}
                    required
                >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                        <option key={category.categoryId} value={category.categoryId}>
                            {category.categoryName}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    name="quantity"
                    value={kit.quantity}
                    onChange={handleChange}
                    placeholder="Quantity"
                    required
                />
                <input
                    type="number"
                    name="price"
                    value={kit.price}
                    onChange={handleChange}
                    placeholder="Price"
                    required
                />
                <textarea
                    name="description"
                    value={kit.description}
                    onChange={handleChange}
                    placeholder="Description"
                    required
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    required
                />
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setLabFile(e.target.files[0])}
                    required
                />
                <button type="submit">Add Kit</button>
            </form>
            <div>
                <h2>Add New Category</h2>
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New Category Name"
                />
                <button onClick={handleAddCategory}>Add Category</button>
            </div>
        </div>
    );
};

export default AddKit;
