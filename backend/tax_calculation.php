<?php
// This function calculates the percentage of taxes deducted from the total pay
function calculateTaxPercentage($totalPay, $totalTaxes) {
    if ($totalPay == 0) {
        return 0; // To avoid division by zero
    }

    // Calculate the percentage of total pay that was taxed
    // $taxPercentage = ($totalTaxes / $totalPay) * 100;
    $taxPercentage = ($totalTaxes / 100) * $totalPay;
    return round($taxPercentage, 2); // Return rounded percentage
}
?>
