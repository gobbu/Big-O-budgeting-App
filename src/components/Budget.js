import React, { useState, useEffect } from "react";
import "./Budget.css";
import Navbar from './Navbar';

// Helper function to format the date to SQL datetime format

const formatSQLDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(d.getDate()+1).padStart(2, '0');
    return `${year}-${month}-${day}`; // Removed ' 00:00:00'
  };

const formatFetchSQLDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};




const getCurrentWeekDates = () => {
    const today = new Date();
    // const firstDay = new Date(today);
    // firstDay.setDate(today.getDate() - (today.getDay() + 6) % 7); // Adjust to start on Monday
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
    return {
        startOfWeek: firstDay,
        endOfWeek: lastDay
    };
};

const getCurrentMonthDates = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month
    return {
        startOfMonth,
        endOfMonth
    };
};

const formatWeek = (date) => {
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
};



const formatMonth = (date) => date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const BudgetPage = ({ setCurrentPage, handleLogout }) => {
    const [weeklyBudget, setWeeklyBudget] = useState([]);
    const [monthlyBudget, setMonthlyBudget] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(getCurrentWeekDates());
    const [currentMonth, setCurrentMonth] = useState(getCurrentMonthDates());

    const [showModal, setShowModal] = useState(false);
    const [newCategory, setNewCategory] = useState({
        id: null,
        icon: "",
        name: "",
        amount: "",
        spent: "",
        date: ""
    });
    const [addPeriod, setAddPeriod] = useState(""); // Track the period ('weekly' or 'monthly')
    const appUrl = process.env.REACT_APP_URL;

    const fetchBudgets = async (period, startDate, endDate) => {
        try {
            let url = `${appUrl}/backend/add_budget.php?period=${period}`;
            url += `&start_date=${formatFetchSQLDate(startDate)}&end_date=${formatFetchSQLDate(endDate)}`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (data.status === 'success') {
                if (period === 'weekly') {
                    setWeeklyBudget(data.budgets);
                } else {
                    setMonthlyBudget(data.budgets);
                }
            } else {
                console.error(`Error fetching ${period} budget:`, data.message);
            }
        } catch (error) {
            console.error(`Error fetching ${period} budget:`, error);
        }
    };

    // Fetch weekly budgets whenever the current week changes
    useEffect(() => {
        fetchBudgets('weekly', currentWeek.startOfWeek, currentWeek.endOfWeek);
    }, [currentWeek]);

    // Fetch monthly budgets whenever the current month changes
    useEffect(() => {
        fetchBudgets('monthly', currentMonth.startOfMonth, currentMonth.endOfMonth);
    }, [currentMonth]);

    const changeWeek = (direction) => {
        const newStartDate = new Date(currentWeek.startOfWeek);
        newStartDate.setDate(newStartDate.getDate() + direction * 7);
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 6);
        setCurrentWeek({
            startOfWeek: newStartDate,
            endOfWeek: newEndDate
        });
    };

    const changeMonth = (direction) => {
        const newStartDate = new Date(currentMonth.startOfMonth);
        newStartDate.setMonth(newStartDate.getMonth() + direction);
        const newEndDate = new Date(newStartDate.getFullYear(), newStartDate.getMonth() + 1, 0);
        setCurrentMonth({
            startOfMonth: newStartDate,
            endOfMonth: newEndDate
        });
    };

    const handleAddCategory = (period) => {
        setAddPeriod(period);
        setNewCategory({
            id: null,
            icon: "",
            name: "",
            amount: "",
            spent: "",
            date: ""
        });
        setShowModal(true);
    };

    const handleIconUpload = async (file) => {
        if (!file) return;
    
        // Define maximum file size (2MB)
        const maxFileSize = 2 * 1024 * 1024; // 2MB
    
        // Validate file size
        if (file.size > maxFileSize) {
            alert("The file is too large. Please upload a file smaller than 2MB.");
            // Clear the uploaded file reference to prevent further actions
            setNewCategory({ ...newCategory, icon: null });
            return;
        }
    
        // Validate file type (ensure it's an image)
        const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validImageTypes.includes(file.type)) {
            alert("Please upload a valid image file (JPEG, PNG, GIF).");
            setNewCategory({ ...newCategory, icon: null });
            return;
        }
    
        const formData = new FormData();
        formData.append("icon", file);
    
        try {
            const response = await fetch(`${appUrl}/backend/upload_icon.php`, {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            console.log("Upload Response:", data); // Debugging
            if (data.status === "success") {
                alert("Icon uploaded successfully!");
                setNewCategory({ ...newCategory, icon: data.icon_url });
            } else {
                alert(`Failed to upload icon: ${data.message}`);
                setNewCategory({ ...newCategory, icon: null });
            }
        } catch (error) {
            console.error("Error uploading icon:", error);
            alert("An error occurred while uploading the icon. Please try again.");
            setNewCategory({ ...newCategory, icon: null });
        }
    };

    const handleSaveCategory = async () => {
        if (!newCategory.name || !newCategory.amount || !newCategory.icon || newCategory.spent === "") {
            alert("Please fill in all fields.");
            return;
        }

        const requestBody = {
            id: newCategory.id,
            category: newCategory.name,
            spent: parseFloat(newCategory.spent),
            limit: parseFloat(newCategory.amount),
            period: addPeriod,
            icon: newCategory.icon, // Base64-encoded icon
        };

        if (addPeriod === 'monthly') {
            requestBody.start_date = formatSQLDate(currentMonth.startOfMonth);
            requestBody.end_date = formatSQLDate(currentMonth.endOfMonth);
        } else {
            if (!newCategory.date) {
                alert("Please select a date for the weekly budget.");
                return;
            }
            requestBody.date = formatSQLDate(new Date(newCategory.date));
        }

        try {
            const response = await fetch(`${appUrl}/backend/add_budget.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();
            if (data.status === 'success') {
                alert('Category saved successfully!');

                // Refetch budgets after adding/editing a category
                fetchBudgets('weekly', currentWeek.startOfWeek, currentWeek.endOfWeek);
                fetchBudgets('monthly', currentMonth.startOfMonth, currentMonth.endOfMonth);

                setShowModal(false);
                setNewCategory({ id: null, icon: "", name: "", amount: "", spent: "", date: "" });
            } else {
                alert(`Failed to save category: ${data.message}`);
            }
        } catch (error) {
            console.error('Error saving category:', error);
            alert('An error occurred while saving the category. Please try again.');
        }
    };

    const handleEditCategory = (category, period) => {
        let categoryData;
        if (period === 'weekly') {
            categoryData = weeklyBudget.find(item => item.category === category);
        } else {
            categoryData = monthlyBudget.find(item => item.category === category);
        }

        setNewCategory({
            id: period === 'weekly' ? categoryData.id : null,
            icon: categoryData.icon,
            name: categoryData.category,
            amount: categoryData.limit,
            spent: categoryData.spent,
            date: categoryData.date ? categoryData.date.split(' ')[0] : ''
        });
        setAddPeriod(period);
        setShowModal(true);
    };

    const handleDeleteCategory = async (category, period) => {
        try {
            const requestBody = {
                category,
                period
            };

            if (period === 'weekly') {
                requestBody.start_date = formatFetchSQLDate(currentWeek.startOfWeek);
                requestBody.end_date = formatFetchSQLDate(currentWeek.endOfWeek);
            } else if (period === 'monthly') {
                requestBody.start_date = formatSQLDate(currentMonth.startOfMonth);
                requestBody.end_date = formatSQLDate(currentMonth.endOfMonth);
            }

            const response = await fetch(`${appUrl}/backend/delete_budget.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();
            if (data.status === 'success') {
                alert('Category deleted successfully!');
                // Refetch budgets after deletion
                fetchBudgets('weekly', currentWeek.startOfWeek, currentWeek.endOfWeek);
                fetchBudgets('monthly', currentMonth.startOfMonth, currentMonth.endOfMonth);
            } else {
                alert(`Failed to delete category: ${data.message}`);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('An error occurred while deleting the category. Please try again.');
        }
    };

    // Updated iconUrlMap with correct URLs
    const iconUrlMap = {
        "grocery_icon": "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/grocery_icon.png",
        "shopping_icon": "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/shopping_icon.png",
        "gas_icon": "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/gas_icon.png",
        "rent_icon": "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/rent_icon.png",
        "transportation_icon": "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/transportation_icon.png",
        "entertainment_icon": "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/entertainment_icon.png",
        "bills_icon": "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/bills_icon.png",
        "restaurant_icon": "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/restaurant_icon.png",
        "misc_icon": "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/misc_icon.png"
    };


    //new renderbudget bars function 
    const renderBudgetBars = (budgetArray, period) => {
        
        if (!budgetArray || budgetArray.length === 0) {
            return <p>No budget data available</p>;
        }
        return budgetArray.map((item, index) => {
            const spent = parseFloat(item?.spent) || 0;
            const limit = parseFloat(item?.limit) || 1;
            const percentage = Math.min((spent / limit) * 100, 100);

            return (
                <div className="budget-item" key={`${item.category}-${index}`}>
                    <div className="circle-text-wrapper">
                        {item?.icon && (
                            <img
                                // src={iconUrlMap[item.icon]}
                                src={iconUrlMap[item.icon] || item.icon ||  "https://example.com/default_icon.png"}
                                alt={`${item.category} icon`}
                                className="category-icon"
                            />
                        )}
                        <span className="category-text">{item.category}</span>
                    </div>
                    <div className="budget-details">
                        <span className="budget-spent">${spent.toFixed(2)}</span>
                        <div className="budget-bar-container">
                            <div
                                className={`budget-bar ${percentage >= 100 ? 'over-budget' : ''}`}
                                style={{ 
                                    width: `${percentage}%`, 
                                    backgroundColor: percentage >= 100 ? 'red' : '#7ED957' 
                                }}
                            ></div>
                        </div>
                        <span className="budget-limit">${limit.toFixed(2)}</span>
                    </div>
                    <div className="budget-controls">
                        <button
                            className="control-button"
                            onClick={() => handleEditCategory(item.category, period)}
                        >
                            <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/edit_button.png" alt="Edit icon" />
                        </button>
                        <button
                            className="control-button"
                            onClick={() => handleDeleteCategory(item.category, period)}
                        >
                            <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/ryancao/build/images/trash_can.png" alt="Delete icon" />
                        </button>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="budget-page">
            <Navbar setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
            <div className="budget-container">
                {/* Weekly Budget Section */}
                <div className="budget-section weekly-budget">
                    <div className="weekly-header">
                        <h2>Weekly</h2>
                        <div className="week-navigation">
                            <button className="week-arrow" onClick={() => changeWeek(-1)}>{'<'}</button>
                            <div className="week-display">{`${formatWeek(currentWeek.startOfWeek)} - ${formatWeek(currentWeek.endOfWeek)}`}</div>
                            <button className="week-arrow" onClick={() => changeWeek(1)}>{'>'}</button>
                        </div>
                        <div className="budget-controls">
                            <button className="control-button add-button" onClick={() => handleAddCategory('weekly')}>+</button>
                        </div>
                    </div>
                    <div className="budget-list">
                        {renderBudgetBars(weeklyBudget, 'weekly')}
                    </div>
                </div>

                {/* Monthly Budget Section */}
                <div className="budget-section monthly-budget">
                    <div className="monthly-header">
                        <h2>Monthly</h2>
                        <div className="month-navigation">
                            <button className="month-arrow" onClick={() => changeMonth(-1)}>{'<'}</button>
                            <div className="month-display">{formatMonth(currentMonth.startOfMonth)}</div>
                            <button className="month-arrow" onClick={() => changeMonth(1)}>{'>'}</button>
                        </div>
                        <div className="budget-controls">
                            <button className="control-button add-button" onClick={() => handleAddCategory('monthly')}>+</button>
                        </div>
                    </div>
                    <div className="budget-list">
                        {renderBudgetBars(monthlyBudget, 'monthly')}
                    </div>
                </div>
            </div>

            {/* Add/Edit Category Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-wide">
                        <h2>{newCategory.id ? 'Edit Category' : 'Add New Category'}</h2>
                        <div className="modal-body">
                            <div className="icon-selection">
                                <label>Select Icon:</label>
                                <div className="icon-grid">
                                    {[
                                        { key: "grocery_icon", url: iconUrlMap["grocery_icon"] },
                                        { key: "shopping_icon", url: iconUrlMap["shopping_icon"] },
                                        { key: "gas_icon", url: iconUrlMap["gas_icon"] },
                                        { key: "rent_icon", url: iconUrlMap["rent_icon"] },
                                        { key: "transportation_icon", url: iconUrlMap["transportation_icon"] },
                                        { key: "entertainment_icon", url: iconUrlMap["entertainment_icon"] },
                                        { key: "bills_icon", url: iconUrlMap["bills_icon"] },
                                        { key: "restaurant_icon", url: iconUrlMap["restaurant_icon"] },
                                        { key: "misc_icon", url: iconUrlMap["misc_icon"] }
                                    ].map((icon) => (
                                        <div
                                            key={icon.key}
                                            onClick={() => setNewCategory({ ...newCategory, icon: icon.key })}
                                            className={`icon-option ${newCategory.icon === icon.key ? 'selected' : ''}`}
                                            style={{ backgroundColor: newCategory.icon === icon.key ? '#7ED957' : '#e0e0e0' }}
                                        >
                                            <img
                                                src={icon.url}
                                                alt={icon.key}
                                                className="category-icon"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <label>Upload Custom Icon:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleIconUpload(e.target.files[0])}
                            />
                            <input
                                type="text"
                                placeholder="Category Name"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Budget Amount"
                                value={newCategory.amount}
                                onChange={(e) => setNewCategory({ ...newCategory, amount: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Amount Spent"
                                value={newCategory.spent}
                                onChange={(e) => setNewCategory({ ...newCategory, spent: e.target.value })}
                            />
                            {addPeriod === 'weekly' && (
                                <input
                                    type="date"
                                    placeholder="Select Date"
                                    value={newCategory.date}
                                    onChange={(e) => setNewCategory({ ...newCategory, date: e.target.value })}
                                />
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="save-button" onClick={handleSaveCategory}>Save</button>
                            <button className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetPage;