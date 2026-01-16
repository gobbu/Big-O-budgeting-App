import React, { useState, useEffect } from 'react';
import './Payments.css'; // Your existing styles
import PayCycleModal from './PayCycleModal';
import PayStubModal from './PayStubModal';
import { handleDelete } from './DeleteTransaction';
import { handleEditTransaction } from './EditTransaction';
import Navbar from './Navbar';
import EditTransactionModal from './EditTransactionModal';
import CollapsibleSections from './CollapsibleSections';


// Array of U.S. states for dropdown selection
const states = [
    { code: '', name: 'Select a state' }, // Placeholder option
    { code: 'AL', name: 'Alabama', tax_rate: 4.00 },
    { code: 'AK', name: 'Alaska', tax_rate: 0.00 },
    { code: 'AZ', name: 'Arizona', tax_rate: 5.60 },
    { code: 'AR', name: 'Arkansas', tax_rate: 6.50 },
    { code: 'CA', name: 'California', tax_rate: 7.25 },
    { code: 'CO', name: 'Colorado', tax_rate: 2.90 },
    { code: 'CT', name: 'Connecticut', tax_rate: 6.35 },
    { code: 'DE', name: 'Delaware', tax_rate: 0.00 },
    { code: 'FL', name: 'Florida', tax_rate: 6.00 },
    { code: 'GA', name: 'Georgia', tax_rate: 4.00 },
    { code: 'HI', name: 'Hawaii', tax_rate: 4.00 },
    { code: 'ID', name: 'Idaho', tax_rate: 6.00 },
    { code: 'IL', name: 'Illinois', tax_rate: 6.25 },
    { code: 'IN', name: 'Indiana', tax_rate: 7.00 },
    { code: 'IA', name: 'Iowa', tax_rate: 6.00 },
    { code: 'KS', name: 'Kansas', tax_rate: 6.50 },
    { code: 'KY', name: 'Kentucky', tax_rate: 6.00 },
    { code: 'LA', name: 'Louisiana', tax_rate: 4.45 },
    { code: 'ME', name: 'Maine', tax_rate: 5.50 },
    { code: 'MD', name: 'Maryland', tax_rate: 6.00 },
    { code: 'MA', name: 'Massachusetts', tax_rate: 6.25 },
    { code: 'MI', name: 'Michigan', tax_rate: 6.00 },
    { code: 'MN', name: 'Minnesota', tax_rate: 6.875 },
    { code: 'MS', name: 'Mississippi', tax_rate: 7.00 },
    { code: 'MO', name: 'Missouri', tax_rate: 4.225 },
    { code: 'MT', name: 'Montana', tax_rate: 0.00 },
    { code: 'NE', name: 'Nebraska', tax_rate: 5.50 },
    { code: 'NV', name: 'Nevada', tax_rate: 6.85 },
    { code: 'NH', name: 'New Hampshire', tax_rate: 0.00 },
    { code: 'NJ', name: 'New Jersey', tax_rate: 6.625 },
    { code: 'NM', name: 'New Mexico', tax_rate: 4.875 },
    { code: 'NY', name: 'New York', tax_rate: 4.00 },
    { code: 'NC', name: 'North Carolina', tax_rate: 4.75 },
    { code: 'ND', name: 'North Dakota', tax_rate: 5.00 },
    { code: 'OH', name: 'Ohio', tax_rate: 5.75 },
    { code: 'OK', name: 'Oklahoma', tax_rate: 4.50 },
    { code: 'OR', name: 'Oregon', tax_rate: 0.00 },
    { code: 'PA', name: 'Pennsylvania', tax_rate: 6.00 },
    { code: 'RI', name: 'Rhode Island', tax_rate: 7.00 },
    { code: 'SC', name: 'South Carolina', tax_rate: 6.00 },
    { code: 'SD', name: 'South Dakota', tax_rate: 4.20 },
    { code: 'TN', name: 'Tennessee', tax_rate: 7.00 },
    { code: 'TX', name: 'Texas', tax_rate: 6.25 },
    { code: 'UT', name: 'Utah', tax_rate: 6.10 },
    { code: 'VT', name: 'Vermont', tax_rate: 6.00 },
    { code: 'VA', name: 'Virginia', tax_rate: 5.30 },
    { code: 'WA', name: 'Washington', tax_rate: 6.50 },
    { code: 'WV', name: 'West Virginia', tax_rate: 6.00 },
    { code: 'WI', name: 'Wisconsin', tax_rate: 5.00 },
    { code: 'WY', name: 'Wyoming', tax_rate: 4.00 },
];

// // Modal Component for adding payments
const Modal = ({ handleClose, handleSelection }) => {
    const [selectedOption, setSelectedOption] = useState('');
    // const [formData, setFormData] = useState({});
    const [payCycleFrequency, setPayCycleFrequency] = useState('');
    const [amountOfWeeks, setAmountOfWeeks] = useState('');
    const appUrl = process.env.REACT_APP_URL;
    
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        whoIsPaying: '',
        whoIsGettingPaid: '',
        transactionAmount: '',
        transactionDate: '',
        transactionNote: '',
        category: ''
    });

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prevData) => ({ ...prevData, [name]: value }));
    // };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${appUrl}/backend/getCategories.php`);
                const data = await response.json();
                console.log("Fetched Categories:", data); // Check the structure here
                if (data.status === "success") {
                    setCategories(data.categories); // Set the categories from the response
                } else {
                    console.error("Error: No categories returned");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const updatedData = { ...prevData, [name]: value };
    
            if (name === 'state' || name === 'federalTaxes' || name === 'other') {
                const stateTaxRate = states.find((state) => state.code === updatedData.state)?.tax_rate || 0;
                const federalTax = parseFloat(updatedData.federalTaxes) || 0;
                const otherDeductions = parseFloat(updatedData.other) || 0;
    
                updatedData.totalTaxes = (federalTax + stateTaxRate + otherDeductions);
            }
    
            return updatedData;
        });
    };

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
        setFormData({});
        setAmountOfWeeks(''); // Reset when option changes
    };

    const handleFrequencyChange = (e) => {
        const { value } = e.target;
        setPayCycleFrequency(value);
        
        // Clear "Amount of Weeks" if the user selects something other than "Weekly"
        if (value !== 'weekly') {
            setAmountOfWeeks('');
        }
    };

    const handleInputChangeWithCurrency = (e) => {
        const { name, value } = e.target;
        const cleanValue = value.replace(/[^0-9.]/g, ''); // Strip any non-numeric characters except the period
        setFormData({
            ...formData,
            [name]: cleanValue
        });
    };

    const renderFormFields = () => {
        switch (selectedOption) {
            case 'Add a Transaction':
                return (
                    <>
                        <div>
                            <label>Who is Paying? (Sender):&nbsp;</label>
                            <input type="text" name="whoIsPaying" value={formData.whoIsPaying || ''} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label>Who is Getting Paid? (Recipient):&nbsp;</label>
                            <input type="text" name="whoIsGettingPaid" value={formData.whoIsGettingPaid || ''} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label>Amount Paid:&nbsp;</label>
                            {/* <input type="text" name="transactionAmount" value={formData.transactionAmount || ''} onChange={handleInputChangeWithCurrency} placeholder="0.00" /> */}
                            <input
                                type="text"
                                name="transactionAmount"
                                value={`$${formData.transactionAmount ? parseFloat(formData.transactionAmount).toFixed(2) : ''}`}
                                onChange={handleInputChangeWithCurrency}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label>Transaction Date:&nbsp;</label>
                            <input type="date" name="transactionDate" value={formData.transactionDate || ''} onChange={handleInputChange} />
                        </div>

                        <div>
                            <label>Select Category:&nbsp;</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                            >
                                <option value="">Select a Category</option>
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <option key={category.id} value={category.category}>
                                            {category.category} ({category.period})
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No categories available</option>
                                )}
                            </select>
                        </div>



                        <label>Add a Note for this Transaction:&nbsp;</label>
                        <div>
                            
                            <textarea name="transactionNote" value={formData.transactionNote || ''} onChange={handleInputChange} rows="4" placeholder="Write your note here..." />
                        </div>
                        {/* <div>
                            <label>State:</label>
                            <select name="state" value={formData.state || ''} onChange={handleInputChange}>
                                {states.map((state) => (
                                    <option key={state.code} value={state.code}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </div> */}
                    </>
                );
            case 'Add a Job':
                return (
                    <>
                        <div>
                            <label>Job Title:&nbsp;</label>
                            <input
                                type="text"
                                name="jobTitle"
                                value={formData.jobTitle || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* <div>
                            <label>Hours Worked:</label>
                            <input
                                type="number"
                                name="hoursWorked"
                                value={formData.hoursWorked || ''}
                                onChange={handleInputChange}
                            />
                        </div> */}
                        <div>
                            <label>Current Rate:&nbsp;</label>
                            <input
                                type="text"
                                name="currentRate"
                                value={`$${formData.currentRate ? parseFloat(formData.currentRate).toFixed(2) : ''}`}
                                onChange={handleInputChangeWithCurrency}
                                placeholder="0.00"
                            />
                        </div>
                        {/* <div>
                            <label>Total Pay:</label>
                            <input
                                type="text"
                                name="totalPay"
                                value={`$${formData.totalPay ? parseFloat(formData.totalPay).toFixed(2) : ''}`}
                                onChange={handleInputChangeWithCurrency}
                                placeholder="0.00"
                            />
                        </div> */}
                        <div>
                            <label>Pay Cycle Start Date:&nbsp;</label>
                            <input
                                type="date"
                                name="cycleStartDate"
                                value={formData.cycleStartDate || ''}
                                onChange={handleInputChange}
                            />
                        </div>
                        {/* <div>
                            <label>Pay Cycle End Date:</label>
                            <input
                                type="date"
                                name="cycleEndDate"
                                value={formData.cycleEndDate || ''}
                                onChange={handleInputChange}
                            />
                        </div> */}

                        <div>
                        <label>Pay Cycle Frequency:&nbsp;</label>
                            <select
                                name="cycleFrequency"
                                value={payCycleFrequency}
                                onChange={handleFrequencyChange}
                            >
                                <option value="" disabled>Select frequency</option>
                                <option value="weekly">Weekly</option>
                                <option value="bi-weekly">Bi-Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="annually">Annually</option>
                            </select>
                        </div>

                        {/* Conditionally render "Amount of Weeks" */}
                        {payCycleFrequency === 'weekly' && (
                            <div>
                                <label>Amount of Weeks:&nbsp;</label>
                                <input
                                    type="number"
                                    name="amountOfWeeks"
                                    value={amountOfWeeks}
                                    onChange={(e) => setAmountOfWeeks(e.target.value)}
                                    placeholder="Enter number of weeks"
                                />
                            </div>
                        )}
                        
                        <h4>Taxes and Deductions</h4>

                        <div>
                            <label>Federal Taxes (%):&nbsp;</label>
                            <input
                                type="text"
                                name="federalTaxes"
                                value={`${formData.federalTaxes ? parseFloat(formData.federalTaxes) : ''}`}
                                onChange={handleInputChangeWithCurrency}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label>State:&nbsp;</label>
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
                            <label>Other (%):&nbsp;</label>
                            <input
                                type="text"
                                name="other"
                                value={formData.other || ''}
                                onChange={handleInputChange}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label>Total Taxes (%) :&nbsp;</label>
                            <input
                                type="text"
                                name="totalTaxes"
                                value={`${formData.totalTaxes ? parseFloat(formData.totalTaxes) : ''}`}
                                onChange={handleInputChangeWithCurrency}
                                placeholder="0"
                            />
                        </div>
                    </>
                );
            case 'Add a Pay Stub':
                return (
                    <>
                        {/* Form Inputs */}
                        <div>
                            <label>Job Title:&nbsp;</label>
                            <input type="text" name="jobTitle" value={formData.jobTitle || ''} onChange={handleInputChange} placeholder="e.g., Software Engineer" />
                        </div>
                        <div>
                            <label>Hours Worked:&nbsp;</label>
                            <input type="number" name="hoursWorked" value={formData.hoursWorked || ''} onChange={handleInputChange} placeholder="e.g., 40" />
                        </div>
                        <div>
                            <label>Current Rate:&nbsp;</label>
                            <input type="text" name="currentRate" value={`$${formData.currentRate || ''}`} onChange={handleInputChangeWithCurrency} placeholder="e.g., 50.00" />
                        </div>
                        <div>
                            <label>Total Pay:&nbsp;</label>
                            <input type="text" name="totalPay" value={`$${formData.totalPay || ''}`} onChange={handleInputChangeWithCurrency} placeholder="e.g., 2000.00" />
                        </div>
                        <div>
                            <label>Pay Date:&nbsp;</label>
                            <input type="date" name="payDate" value={formData.payDate || ''} onChange={handleInputChange} />
                        </div>
                        <hr />
                        <h4>Taxes and Deductions</h4>

                        <div>
                            <label>Federal Taxes (%):&nbsp;</label>
                            <input
                                type="text"
                                name="federalTaxes"
                                value={`${formData.federalTaxes ? parseFloat(formData.federalTaxes) : ''}`}
                                onChange={handleInputChangeWithCurrency}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label>State:&nbsp;</label>
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
                            <label>Other (%):&nbsp;</label>
                            <input
                                type="text"
                                name="other"
                                value={formData.other || ''}
                                onChange={handleInputChange}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label>Total Taxes (%) :&nbsp;</label>
                            <input
                                type="text"
                                name="totalTaxes"
                                value={`${formData.totalTaxes ? parseFloat(formData.totalTaxes) : ''}`}
                                onChange={handleInputChangeWithCurrency}
                                placeholder="0"
                            />
                        </div>
                        {/* <div className="modal-buttons">
                            <button onClick={handleSubmit}>Submit</button>
                            <button onClick={handleClose}>Cancel</button>
                        </div> */}
                    </>
                )
            default:
return null;
        }
};


const handleSubmit = () => {
    if (!selectedOption) {
        alert('Please select an option before submitting.');
        return;
    }

    const data = { option: selectedOption, ...formData, cycleFrequency: payCycleFrequency,};

    if (payCycleFrequency === 'weekly') {
        data.amountOfWeeks = amountOfWeeks; // Include amountOfWeeks if weekly frequency is selected
    }

    let endpoint;
        switch (selectedOption) {
            case 'Add a Transaction':
                endpoint = 'payments.php';
                break;
            case 'Add a Job':
                endpoint = 'pay_cycles.php';
                break;
            case 'Add a Pay Stub':
                endpoint = 'pay_stubs.php';
                break;
            default:
                console.error('Invalid option selected');
                return;
        }


    fetch(`${appUrl}/backend/${endpoint}`, {
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
            <h3>Select Payment Options</h3>
            <div className="options-container">
                <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                    <option value="">Select</option>
                    <option value="Add a Transaction">Add a Transaction</option>
                    <option value="Add a Job">Add a Job</option>
                    <option value="Add a Pay Stub">Add a Pay Stub</option>
                    
                </select>
            </div>
            <div className="form-container">{renderFormFields()}</div>
            <div className="modal-buttons">
                <button onClick={handleSubmit}>Confirm</button>
                <button onClick={handleClose}>Cancel</button>
            </div>
        </div>
    </div>
);
};

// Main Payments Component
const Payments = ({ setCurrentPage, handleLogout }) => {
    const appUrl = process.env.REACT_APP_URL;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPayCycleModalOpen, setIsPayCycleModalOpen] = useState(false);
    const [payments, setPayments] = useState([]);
    const [payCycles, setPayCycles] = useState([]); // New state for Pay Cycles
    const [isPayStubModalOpen, setIsPayStubModalOpen] = useState(false); // State for Pay Stub Modal
    const [payStubs, setPayStubs] = useState([]); // State for storing pay stubs

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Toggle Modal for Adding Payments
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // Open the Edit Modal for Editing Payments
    const openEditModal = (transaction) => {
        setSelectedTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const togglePayCycleModal = () => {
        setIsPayCycleModalOpen(!isPayCycleModalOpen);
    };

    const togglePayStubModal = () => {
        setIsPayStubModalOpen(!isPayStubModalOpen);
    };

    // Fetch existing payments
    useEffect(() => {
        const fetchPayments = fetch(`${appUrl}/backend/payments.php`, { method: 'GET', credentials: 'include' })
            .then((response) => response.json());

        const fetchPayCycles = fetch(`${appUrl}/backend/pay_cycles.php`, { method: 'GET', credentials: 'include' })
            .then((response) => response.json());

        const fetchPayStubs = fetch(`${appUrl}/backend/pay_stubs.php`, { method: 'GET', credentials: 'include' })
            .then((response) => response.json());

        Promise.all([fetchPayments, fetchPayCycles, fetchPayStubs])
            .then(([paymentsData, payCyclesData, payStubsData]) => {
                if (paymentsData.status === 'success') {
                    setPayments(paymentsData.payments);
                } else {
                    console.error('Error fetching payments:', paymentsData.message);
                }

                if (payCyclesData.status === 'success') {
                    setPayCycles(payCyclesData.pay_cycles);
                } else {
                    console.error('Error fetching jobs:', payCyclesData.message);
                }

                if (payStubsData.status === 'success') {
                    setPayStubs(payStubsData.pay_stubs);
                } else {
                    console.error('Error fetching pay stubs:', payStubsData.message);
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, [appUrl]);


    // Logout function
    const logout = () => {
        fetch(`${appUrl}/backend/logout.php`, {
            method: 'POST',
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'success') {
                    handleLogout(); // Update the auth state and navigate to the login page
                } else {
                    alert('Failed to log out.');
                }
            })
            .catch((error) => {
                console.error('Error logging out:', error);
            });
    };

    // Navigate to the specified page
    const navigateToPage = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="homepage-container">
            {/* Sidebar */}
            <Navbar setCurrentPage={setCurrentPage} handleLogout={handleLogout} />

            {/* Main Content */}
            <div className="main-content">
                <button className="modal-button" onClick={toggleModal}>
                    <div className="plus">+</div>
                    <div className="label">Add Payment</div>
                </button>
            
            {/* Modal Component */}
            {isModalOpen && <Modal handleClose={toggleModal} handleSelection={toggleModal} />}
            {isPayCycleModalOpen && <PayCycleModal handleClose={togglePayCycleModal} handleSelection={togglePayCycleModal} />}
            {isPayStubModalOpen && <PayStubModal handleClose={togglePayStubModal} handleSelection={togglePayStubModal} />}
            

            {/* Edit Transaction Modal */}
            {isEditModalOpen && (
                <EditTransactionModal
                    transaction={selectedTransaction}
                    handleClose={() => setIsEditModalOpen(false)}
                    handleEdit={handleEditTransaction}  // Pass handleEditTransaction function
                    appUrl={appUrl}
                    payments={payments}
                    setPayments={setPayments}
                />
            )}



            {/* Existing Payments Section */}
            <CollapsibleSections 
                    payments={payments}
                    payCycles={payCycles}
                    payStubs={payStubs}
                    openEditModal={openEditModal}
                    handleDelete={handleDelete}
                    appUrl={appUrl}
                    setPayments={setPayments}
                />
            </div>
        </div>
    );
};

export default Payments;

