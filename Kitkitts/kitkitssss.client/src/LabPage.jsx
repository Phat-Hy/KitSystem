import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LabPage = () => {
    const [labFiles, setLabFiles] = useState([]);
    const [error, setError] = useState(null);

    const fetchLabFiles = async () => {
        try {
            const response = await axios.get('/api/labs');
            console.log('API Response:', response.data); // Log the response to check its structure

            // Check for the expected structure and extract lab files
            if (response.data && response.data.$values) {
                const finishedOrders = response.data.$values;

                // Extract lab files from finished orders
                const labFiles = finishedOrders.map(order => ({
                    ordersId: order.ordersId,
                    receiveName: order.receiveName,
                    receivePhoneNumbers: order.receivePhoneNumbers,
                    labFiles: order.labFiles?.$values || [] // Safely access labFiles
                }));

                // Check if there are any lab files
                if (labFiles.length > 0) {
                    setLabFiles(labFiles);
                } else {
                    setError('No lab files available.');
                }
            } else {
                setError('Unexpected response format. Expected an array.');
            }
        } catch (error) {
            console.error('Error fetching lab files:', error);
            setError('Error fetching lab files. Please try again later.');
        }
    };

    useEffect(() => {
        fetchLabFiles();
    }, []);

    return (
        <div>
            <h1>Lab Files</h1>
            {error && <p>{error}</p>}
            {labFiles.length > 0 ? (
                <ul>
                    {labFiles.map((order) => (
                        <li key={order.ordersId}>
                            <h2>Order ID: {order.ordersId}</h2>
                            <p>Received by: {order.receiveName}</p>
                            <p>Phone: {order.receivePhoneNumbers}</p>
                            <ul>
                                {order.labFiles.map((lab) => (
                                    <li key={lab.kitId}>
                                        <p>Kit Name: {lab.kitName}</p>
                                        <p>Description: {lab.description}</p>
                                        {/* Add link to download the PDF file */}
                                        {lab.pdfData ? (
                                            <a href={`data:application/pdf;base64,${lab.pdfData}`} download={`${lab.kitName}.pdf`}>
                                                Download PDF
                                            </a>
                                        ) : (
                                            <p>No PDF available for this kit.</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No lab files available.</p>
            )}
        </div>
    );
};

export default LabPage;