import React, { useEffect, useState } from 'react';

const UpdateKit = () => {
    const [kits, setKits] = useState([]);
    const [selectedKitId, setSelectedKitId] = useState('');
    const [kitDetails, setKitDetails] = useState({
        kitName: '',
        description: '',
        categoryName: '',
        quantity: '',
        price: '',
        kitStatusName: '',
        kitImage: null // New state for the kit image
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [kitStatuses, setKitStatuses] = useState([]);

    useEffect(() => {
        const fetchKits = async () => {
            const response = await fetch('http://localhost:5138/api/Kits');
            const data = await response.json();
            if (data && Array.isArray(data.$values)) {
                setKits(data.$values);
            }
        };
        fetchKits();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await fetch('http://localhost:5138/api/categories');
            const data = await response.json();
            if (data && data.$values && Array.isArray(data.$values)) {
                setCategories(data.$values);
            } else {
                console.error('Unexpected data format:', data);
                setCategories([]);
            }
        };

        const fetchKitStatuses = async () => {
            const response = await fetch('http://localhost:5138/api/kitstatuses');
            const data = await response.json();
            if (data && data.$values && Array.isArray(data.$values)) {
                setKitStatuses(data.$values);
            } else {
                console.error('Unexpected data format:', data);
                setKitStatuses([]);
            }
        };

        fetchCategories();
        fetchKitStatuses();
    }, []);

    const handleKitSelection = async (kitId) => {
        setSelectedKitId(kitId);

        // Fetch existing kit details
        const response = await fetch(`http://localhost:5138/api/Kits/${kitId}`);
        if (response.ok) {
            const data = await response.json();
            setKitDetails({
                kitName: data.kitName || '',
                description: data.description || '',
                categoryName: data.categoryName || '',
                quantity: data.quantity || '',
                price: data.price || '',
                kitStatusName: data.kitStatusName || '',
                kitImage: null // reset image as it's not fetched
            });
        } else {
            alert('Error fetching kit details');
        }
    };

    const handleFileChange = (event) => {
        setPdfFile(event.target.files[0]);
    };

    const handleImageChange = (event) => {
        setKitDetails({ ...kitDetails, kitImage: event.target.files[0] });
    };

    const handleUpdateKit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('kitId', selectedKitId);
        formData.append('kitName', kitDetails.kitName);
        formData.append('description', kitDetails.description);
        formData.append('quantity', kitDetails.quantity);
        formData.append('price', kitDetails.price);
        formData.append('kitStatusId', kitStatuses.find(status => status.kitStatusName === kitDetails.kitStatusName)?.kitStatusId);
        formData.append('categoryId', categories.find(category => category.categoryName === kitDetails.categoryName)?.categoryId);

        if (kitDetails.kitImage) {
            formData.append('kitImage', kitDetails.kitImage);
        }

        if (pdfFile) {
            formData.append('labPdf', pdfFile);
        }

        try {
            const response = await fetch(`http://localhost:5138/api/Kits/${selectedKitId}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Update failed:', errorData);
                alert('Error updating kit: ' + errorData.errors['kitUpdate.KitName']?.[0] || 'Unknown error');
            } else {
                alert('Kit updated successfully');
                // Reset form state or redirect as necessary
            }
        } catch (error) {
            console.error('Error updating kit:', error);
            alert('Error updating kit');
        }
    };

    return (
        <div>
            <h2>Update Kit</h2>
            <select onChange={(e) => handleKitSelection(e.target.value)} value={selectedKitId}>
                <option value="">Select a kit</option>
                {kits.map(kit => (
                    <option key={kit.kitId} value={kit.kitId}>
                        {kit.kitName}
                    </option>
                ))}
            </select>

            {selectedKitId && (
                <form onSubmit={handleUpdateKit}>
                    <div>
                        <label>Kit Name:</label>
                        <input
                            type="text"
                            value={kitDetails.kitName}
                            onChange={(e) => setKitDetails({ ...kitDetails, kitName: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea value={kitDetails.description} onChange={(e) => setKitDetails({ ...kitDetails, description: e.target.value })} required />
                    </div>
                    <div>
                        <label>Category:</label>
                        <select value={kitDetails.categoryName} onChange={(e) => setKitDetails({ ...kitDetails, categoryName: e.target.value })} required>
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.categoryId} value={category.categoryName}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Quantity:</label>
                        <input type="number" value={kitDetails.quantity} onChange={(e) => setKitDetails({ ...kitDetails, quantity: e.target.value })} required />
                    </div>
                    <div>
                        <label>Price:</label>
                        <input type="number" value={kitDetails.price} onChange={(e) => setKitDetails({ ...kitDetails, price: e.target.value })} required />
                    </div>
                    <div>
                        <label>Kit Status:</label>
                        <select value={kitDetails.kitStatusName} onChange={(e) => setKitDetails({ ...kitDetails, kitStatusName: e.target.value })} required>
                            <option value="">Select a status</option>
                            {kitStatuses.map(status => (
                                <option key={status.kitStatusId} value={status.kitStatusName}>
                                    {status.kitStatusName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Kit Image:</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} required />
                    </div>
                    <div>
                        <label>Lab PDF:</label>
                        <input type="file" accept=".pdf" onChange={handleFileChange} required />
                    </div>
                    <button type="submit">Update Kit</button>
                </form>
            )}
        </div>
    );
};

export default UpdateKit;
