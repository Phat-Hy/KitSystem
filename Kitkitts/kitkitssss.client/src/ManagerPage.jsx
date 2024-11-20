import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const ManagerPage = () => {
    return (
        <div>
            <h1>Manager Dashboard</h1>
            {/* Other content for the manager page */}

            {/* Add Kit button that links to AddKit component */}
            <Link to="/add-kit">
                <button>Add Kit</button>
            </Link>

            {/* Update Kit button that links to UpdateKit component */}
            <Link to="/update-kit">
                <button>Update Kit</button>
            </Link>
        </div>
    );
};

export default ManagerPage;
