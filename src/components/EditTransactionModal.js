import React, { useState, useEffect } from 'react';
import './EditTransactionModal.css';

const EditTransactionModal = ({ transaction, handleClose, handleEdit, appUrl, payments, setPayments }) => {
    const [updatedTransaction, setUpdatedTransaction] = useState({
        type: transaction.type,
        transactionAmount: transaction.transactionAmount,
        transactionDate: transaction.transactionDate,
        whoIsPaying: transaction.whoIsPaying,
        whoIsGettingPaid: transaction.whoIsGettingPaid,
        state: transaction.state,
        transactionNote: transaction.transactionNote,
        category: transaction.category // Use category with lowercase
    });

    const [categories, setCategories] = useState([]);

    // Fetch categories for the specific user when the component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${appUrl}/backend/getCategories.php`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (data.status === 'success') {
                    setCategories(data.categories); // Assuming categories is an array of category objects
                } else {
                    console.error('Failed to fetch categories');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [appUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedTransaction((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        handleEdit(transaction.id, updatedTransaction, appUrl, payments, setPayments);
        handleClose(); // Close modal after submission
    };

    return (
        <div className="overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevents closing on clicking modal content */}
                <h2>Edit Transaction</h2>
                <div>
                    Sender:&nbsp;
                    <input
                        type="text"
                        name="whoIsPaying"
                        value={updatedTransaction.whoIsPaying}
                        onChange={handleChange}
                        placeholder="Who is paying?"
                    />
                </div>

                <div>
                    Recipient:&nbsp;
                    <input
                        type="text"
                        name="whoIsGettingPaid"
                        value={updatedTransaction.whoIsGettingPaid}
                        onChange={handleChange}
                        placeholder="Who is getting paid?"
                    />
                </div>

                <div>
                    Transaction:&nbsp;
                    <input
                        type="number"
                        name="transactionAmount"
                        value={updatedTransaction.transactionAmount}
                        onChange={handleChange}
                        placeholder="Transaction Amount"
                    />
                </div>

                <div>
                    Transaction Date:&nbsp;
                    <input
                        type="date"
                        name="transactionDate"
                        value={updatedTransaction.transactionDate}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    Category:&nbsp;
                    <select
                        name="category" // Change to category with lowercase
                        value={updatedTransaction.category || ''} // Set default value if undefined
                        onChange={handleChange}
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.category}> {/* Use category with lowercase */}
                                {category.category} ({category.period})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    Note:&nbsp;
                </div>
                <textarea
                    name="transactionNote"
                    value={updatedTransaction.transactionNote}
                    onChange={handleChange}
                    placeholder="Transaction Note"
                />
                <div>
                    <button onClick={handleSubmit}>Submit</button>
                    <button className="cancel" onClick={handleClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default EditTransactionModal;
