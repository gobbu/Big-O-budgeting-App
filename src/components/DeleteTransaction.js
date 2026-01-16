export const handleDelete = (paymentId, appUrl, payments, setPayments) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmDelete) {
        return;
    }

    fetch(`${appUrl}/backend/payments.php`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: paymentId }),
        credentials: 'include',
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.status === 'success') {
            // Remove the deleted transaction from the state
            setPayments(payments.filter(payment => payment.id !== paymentId));
        } else {
            console.error('Error deleting transaction:', data.message);
        }
    })
    .catch((error) => {
        console.error('Error sending delete request:', error);
    });
};
