import React, { useState } from 'react';
import './CollapsibleSections.css';

const CollapsibleSections = ({ payments, payCycles, payStubs, openEditModal, handleDelete, appUrl, setPayments }) => {
    const [expandedSection, setExpandedSection] = useState({
        payments: false,
        jobs: false,
        payStubs: false,
    });

    const toggleSection = (section) => {
        setExpandedSection((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
    };

    return (
        // <div className="existing-sections-container">
        //     {/* Existing Payments Section */}
        //     <div className="existing-section">
        //         <h2 onClick={() => toggleSection('payments')} style={{ cursor: 'pointer' }}>
        //             Existing Payments {expandedSection.payments ? '▲' : '▼'}
        //         </h2>
        //         {expandedSection.payments && (
        //             <div className="card-list">
        //                 {payments.map((payment) => (
        //                     <div key={payment.id} className="card">
        //                         <h3>Recent Transaction</h3>
        //                         <p><strong>Sender:</strong> {payment.whoIsPaying}</p>
        //                         <p><strong>Receiver:</strong> {payment.whoIsGettingPaid}</p>
        //                         <p><strong>Amount:</strong> ${payment.transactionAmount}</p>
        //                         <p><strong>Date:</strong> {payment.transactionDate}</p>
        //                         <p><strong>Category:</strong> {payment.category}</p>
        //                         {payment.transactionNote && <p><strong>Note:</strong> {payment.transactionNote}</p>}
        //                         {/* <button onClick={() => openEditModal(payment)}>Edit</button>
        //                         <button className="delete-button" onClick={() => handleDelete(payment.id, appUrl, payments, setPayments)}>
        //                             Delete
        //                         </button> */}
        //                         {/* Styled Edit and Delete buttons */}
        //                         <div className="button-container">
        //                             <button 
        //                                 className="edit-button" 
        //                                 onClick={() => openEditModal(payment)}
        //                             >
        //                                 Edit
        //                             </button>
        //                             <button 
        //                                 className="delete-button" 
        //                                 onClick={() => handleDelete(payment.id, appUrl, payments, setPayments)}
        //                             >
        //                                 Delete
        //                             </button>
        //                         </div>
        //                     </div>
        //                 ))}
        //             </div>
        //         )}
        //     </div>

            

        //     {/* Existing Jobs Section */}
        //     <div className="existing-section">
        //         <h2 onClick={() => toggleSection('jobs')} style={{ cursor: 'pointer' }}>
        //             Existing Jobs {expandedSection.jobs ? '▲' : '▼'}
        //         </h2>
        //         {expandedSection.jobs && (
        //             <div className="card-list">
        //                 {payCycles.map((cycle) => (
        //                     <div key={cycle.id} className="card">
        //                         <h3>{cycle.jobTitle} - Pay Cycle</h3>
        //                         <p><strong>Current Rate:</strong> ${cycle.currentRate}</p>
        //                         <p><strong>Start:</strong> {cycle.cycleStartDate}</p>
        //                         <p><strong>Frequency:</strong> 
        //                             {cycle.amountOfWeeks !== 0 ? `Every ${cycle.amountOfWeeks} Weeks` : cycle.cycleFrequency}
        //                         </p>
        //                         <p><strong>Tax Percentage:</strong> {cycle.taxPercentage}%</p>
        //                     </div>
        //                 ))}
        //             </div>
        //         )}
        //     </div>

        //     {/* Existing Pay Stubs Section */}
        //     <div className="existing-section">
        //         <h2 onClick={() => toggleSection('payStubs')} style={{ cursor: 'pointer' }}>
        //             Existing Pay Stubs {expandedSection.payStubs ? '▲' : '▼'}
        //         </h2>
        //         {expandedSection.payStubs && (
        //             <div className="card-list">
        //                 {payStubs.map((stub) => (
        //                     <div key={stub.id} className="card">
        //                         <h3>{stub.jobTitle} - Pay Stub</h3>
        //                         <p><strong>Hours Worked:</strong> {stub.hoursWorked}</p>
        //                         <p><strong>Current Rate:</strong> ${stub.currentRate}</p>
        //                         <p><strong>Tax Percentage:</strong> {stub.taxPercentage}%</p>
        //                     </div>
        //                 ))}
        //             </div>
        //         )}
        //     </div>
        // </div>


        <div className="existing-sections-container">
        {/* Existing Payments Section */}
        <div className="existing-section">
            <h2 onClick={() => toggleSection('payments')} style={{ cursor: 'pointer' }}>
                Existing Payments ({payments.length}) {expandedSection.payments ? '▲' : '▼'}
            </h2>
            {expandedSection.payments && (
                <div className="card-list">
                    {payments.length > 0 ? (
                        payments.map((payment) => (
                            <div key={payment.id} className="card">
                                <h3>Recent Transaction</h3>
                                <p><strong>Sender:</strong> {payment.whoIsPaying}</p>
                                <p><strong>Receiver:</strong> {payment.whoIsGettingPaid}</p>
                                <p><strong>Amount:</strong> ${payment.transactionAmount}</p>
                                <p><strong>Date:</strong> {payment.transactionDate}</p>
                                <p><strong>Category:</strong> {payment.category}</p>
                                {payment.transactionNote && (
                                    <p><strong>Note:</strong> {payment.transactionNote}</p>
                                )}
                                <div className="button-container">
                                    <button
                                        className="edit-button"
                                        onClick={() => openEditModal(payment)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            handleDelete(payment.id, appUrl, payments, setPayments)
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-message">
                            No payments yet. Add a payment to get started!
                        </p>
                    )}
                </div>
            )}
        </div>

        {/* Existing Jobs Section */}
        <div className="existing-section">
            <h2 onClick={() => toggleSection('jobs')} style={{ cursor: 'pointer' }}>
                Existing Jobs ({payCycles.length}) {expandedSection.jobs ? '▲' : '▼'}
            </h2>
            {expandedSection.jobs && (
                <div className="card-list">
                    {payCycles.length > 0 ? (
                        payCycles.map((cycle) => (
                            <div key={cycle.id} className="card">
                                <h3>{cycle.jobTitle} - Pay Cycle</h3>
                                <p><strong>Current Rate:</strong> ${cycle.currentRate}</p>
                                <p><strong>Start:</strong> {cycle.cycleStartDate}</p>
                                <p>
                                    <strong>Frequency:</strong>{' '}
                                    {cycle.amountOfWeeks !== 0
                                        ? `Every ${cycle.amountOfWeeks} Weeks`
                                        : cycle.cycleFrequency}
                                </p>
                                <p><strong>Tax Percentage:</strong> {cycle.taxPercentage}%</p>
                            </div>
                        ))
                    ) : (
                        <p className="empty-message">No jobs yet. Add a job to get started!</p>
                    )}
                </div>
            )}
        </div>

        {/* Existing Pay Stubs Section */}
        <div className="existing-section">
            <h2 onClick={() => toggleSection('payStubs')} style={{ cursor: 'pointer' }}>
                Existing Pay Stubs ({payStubs.length}) {expandedSection.payStubs ? '▲' : '▼'}
            </h2>
            {expandedSection.payStubs && (
                <div className="card-list">
                    {payStubs.length > 0 ? (
                        payStubs.map((stub) => (
                            <div key={stub.id} className="card">
                                <h3>{stub.jobTitle} - Pay Stub</h3>
                                <p><strong>Hours Worked:</strong> {stub.hoursWorked}</p>
                                <p><strong>Current Rate:</strong> ${stub.currentRate}</p>
                                <p><strong>Tax Percentage:</strong> {stub.taxPercentage}%</p>
                            </div>
                        ))
                    ) : (
                        <p className="empty-message">
                            No pay stubs yet. Add a pay stub to get started!
                        </p>
                    )}
                </div>
            )}
        </div>
    </div>

    ); //closing bracket for return 



}; // closing bracket for entire file 

export default CollapsibleSections;
