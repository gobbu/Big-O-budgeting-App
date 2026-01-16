import React, { useState } from 'react';
import './Payments.css'; // Ensure CSS is applied

// Array of U.S. states for dropdown selection
const states = [
    { code: '', name: 'Select a state' },
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
];

const PayCycleModal = ({ handleClose, handleSelection }) => {
    const [formData, setFormData] = useState({});
    const appUrl = process.env.REACT_APP_URL;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleInputChangeWithCurrency = (e) => {
        const { name, value } = e.target;
        const cleanValue = value.replace(/[^0-9.]/g, ''); // Strip non-numeric characters except the period
        setFormData({
            ...formData,
            [name]: cleanValue
        });
    };
    const handleSubmit = () => {
        // Use null if date is not set or improperly formatted
        const data = {
            jobTitle: formData.jobTitle,
            hoursWorked: parseFloat(formData.hoursWorked) || 0,
            currentRate: parseFloat(formData.currentRate) || 0,
            totalPay: parseFloat(formData.totalPay) || 0,
            cycleStartDate: formData.cycleStartDate && /^\d{4}-\d{2}-\d{2}$/.test(formData.cycleStartDate) ? formData.cycleStartDate : null,
            cycleEndDate: formData.cycleEndDate && /^\d{4}-\d{2}-\d{2}$/.test(formData.cycleEndDate) ? formData.cycleEndDate : null,
            federalTaxes: parseFloat(formData.federalTaxes) || 0,
            state: formData.state || '',
            other: parseFloat(formData.other) || 0,
            totalTaxes: parseFloat(formData.totalTaxes) || 0,
        };
    
        console.log('Submitting Pay Cycle Data:', data);
    
        fetch(`${appUrl}/backend/pay_cycles.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'success') {
                    handleSelection();
                    handleClose();
                } else {
                    console.error('Error:', data.message);
                }
            })
            .catch((error) => {
                console.error('Error sending data:', error);
            });
    };
    return (
        <div className="modal-overlay">
            <div className="modal-window">
                <h3>Add a Pay Cycle</h3>
                <div>
                    <label>Job Title:</label>
                    <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Hours Worked:</label>
                    <input
                        type="number"
                        name="hoursWorked"
                        value={formData.hoursWorked || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Current Rate:</label>
                    <input
                        type="text"
                        name="currentRate"
                        value={`$${formData.currentRate ? parseFloat(formData.currentRate).toFixed(2) : ''}`}
                        onChange={handleInputChangeWithCurrency}
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label>Total Pay:</label>
                    <input
                        type="text"
                        name="totalPay"
                        value={`$${formData.totalPay ? parseFloat(formData.totalPay).toFixed(2) : ''}`}
                        onChange={handleInputChangeWithCurrency}
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label>Pay Cycle Start Date:</label>
                    <input
                        type="date"
                        name="cycleStartDate"
                        value={formData.cycleStartDate || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Pay Cycle End Date:</label>
                    <input
                        type="date"
                        name="cycleEndDate"
                        value={formData.cycleEndDate || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Federal Taxes:</label>
                    <input
                        type="text"
                        name="federalTaxes"
                        value={`$${formData.federalTaxes ? parseFloat(formData.federalTaxes).toFixed(2) : ''}`}
                        onChange={handleInputChangeWithCurrency}
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label>State:</label>
                    <select
                        name="state"
                        value={formData.state || ''}
                        onChange={handleInputChange}
                    >
                        {states.map((state) => (
                            <option key={state.code} value={state.code}>
                                {state.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Other:</label>
                    <input
                        type="text"
                        name="other"
                        value={formData.other || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Total Taxes:</label>
                    <input
                        type="text"
                        name="totalTaxes"
                        value={`$${formData.totalTaxes ? parseFloat(formData.totalTaxes).toFixed(2) : ''}`}
                        onChange={handleInputChangeWithCurrency}
                        placeholder="0.00"
                    />
                </div>
                <div className="modal-buttons">
                    <button onClick={handleSubmit}>Submit</button>
                    <button onClick={handleClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default PayCycleModal;