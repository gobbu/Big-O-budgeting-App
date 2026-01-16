import React, { useState } from 'react';
import './Payments.css'; // Include your existing styles

// Array of U.S. states for dropdown selection
const states = [
    { code: '', name: 'Select a state' },
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
];

const PayStubModal = ({ handleClose, handleSelection }) => {
    const [formData, setFormData] = useState({});
    const appUrl = process.env.REACT_APP_URL;

    // Handle input changes for text and number fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handle input changes for currency fields
    const handleInputChangeWithCurrency = (e) => {
        const { name, value } = e.target;
        const cleanValue = value.replace(/[^0-9.]/g, ''); // Strip non-numeric characters except the period
        setFormData({
            ...formData,
            [name]: cleanValue
        });
    };

    // Handle submission of the Pay Stub data
    const handleSubmit = () => {
        const data = { ...formData };

        fetch(`${appUrl}/backend/pay_stubs.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'success') {
                    handleSelection(); // Call handleSelection if the request is successful
                    handleClose(); // Close the modal
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
                <h3>Add a Pay Stub</h3>
                {/* Form Inputs */}
                <div>
                    <label>Job Title:</label>
                    <input type="text" name="jobTitle" value={formData.jobTitle || ''} onChange={handleInputChange} placeholder="e.g., Software Engineer" />
                </div>
                <div>
                    <label>Hours Worked:</label>
                    <input type="number" name="hoursWorked" value={formData.hoursWorked || ''} onChange={handleInputChange} placeholder="e.g., 40" />
                </div>
                <div>
                    <label>Current Rate:</label>
                    <input type="text" name="currentRate" value={`$${formData.currentRate || ''}`} onChange={handleInputChangeWithCurrency} placeholder="e.g., 50.00" />
                </div>
                <div>
                    <label>Total Pay:</label>
                    <input type="text" name="totalPay" value={`$${formData.totalPay || ''}`} onChange={handleInputChangeWithCurrency} placeholder="e.g., 2000.00" />
                </div>
                <div>
                    <label>Pay Date:</label>
                    <input type="date" name="payDate" value={formData.payDate || ''} onChange={handleInputChange} />
                </div>
                <hr />
                <h4>Taxes and Deductions</h4>
                <div>
                    <label>Federal Taxes:</label>
                    <input type="text" name="federalTaxes" value={`$${formData.federalTaxes || ''}`} onChange={handleInputChangeWithCurrency} placeholder="e.g., 100.00" />
                </div>
                <div>
                    <label>State:</label>
                    <select name="state" value={formData.state || ''} onChange={handleInputChange}>
                        {states.map((state) => (
                            <option key={state.code} value={state.code}>
                                {state.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Other Deductions:</label>
                    <input type="text" name="other" value={formData.other || ''} onChange={handleInputChange} placeholder="e.g., 50.00" />
                </div>
                <div>
                    <label>Total Taxes:</label>
                    <input type="text" name="totalTaxes" value={`$${formData.totalTaxes || ''}`} onChange={handleInputChangeWithCurrency} placeholder="e.g., 150.00" />
                </div>
                {/* <div className="modal-buttons">
                    <button onClick={handleSubmit}>Submit</button>
                    <button onClick={handleClose}>Cancel</button>
                </div> */}
            </div>
        </div>
    );
};

export default PayStubModal;