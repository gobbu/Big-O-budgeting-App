export const handleEditTransaction = (paymentId, updatedTransaction, appUrl, payments, setPayments) => {
    // Validate the updatedTransaction fields before sending the request
    if (!updatedTransaction.category || !updatedTransaction.transactionAmount || !updatedTransaction.transactionDate) {
        console.error("Missing required fields for transaction");
        return; // Prevent the request if there are missing fields
    }

    // Send PUT request to backend to edit the transaction
    fetch(`${appUrl}/backend/payments.php`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: paymentId,
            type: updatedTransaction.type,
            transactionAmount: updatedTransaction.transactionAmount,
            transactionDate: updatedTransaction.transactionDate,
            whoIsPaying: updatedTransaction.whoIsPaying,
            whoIsGettingPaid: updatedTransaction.whoIsGettingPaid,
            state: updatedTransaction.state, // Make sure `state` is included if needed
            transactionNote: updatedTransaction.transactionNote,
            category: updatedTransaction.category, // Updated category field
        }),
        credentials: 'include', // Include cookies for authentication
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.status === 'success') {
            // Update the state with the modified transaction
            const updatedPayments = payments.map(payment =>
                payment.id === paymentId ? { ...payment, ...updatedTransaction } : payment
            );
            setPayments(updatedPayments); // Update the state with the edited transaction
        } else {
            console.error('Error updating transaction:', data.message); // Log error if status isn't success
        }
    })
    .catch((error) => {
        console.error('Error sending update request:', error); // Log error in case of network or other failures
        // Optionally update the UI with an error message to inform the user
        // setError("An error occurred while updating the transaction");
    });
};
