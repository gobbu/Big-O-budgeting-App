import React from 'react';
import Navbar from './Navbar';
import './Rewards.css'; // Import the component-specific CSS

const Rewards = ({ setCurrentPage, handleLogout }) => {
    // const balance = 300;
    const balance = "Point Balance coming soon!";

    const handleThemesClick = () => {
        alert('Themes Coming Soon!');
    };

    const handleAvatarsClick = () => {
        alert('Avatars Coming Soon!');
    };

    return (
    <div className="rewards-page">
        <Navbar setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
        <div className="rewards-content">
            <h1 className="cash-points">Cash Your Points</h1>


            {/* Balance */}
            <div className="balance-box">
                <p>Your Balance: <br></br> <span className="balance-amount">{balance}</span></p>
            </div>

            {/* Milestons Area */}
            <div className="milestones-area"> 
                <div className="milestones-text">Milestones</div>
                <div className="milestones-box">
                    <div className="checkbox-item">
                        <input type="checkbox" id="milestone1" />
                        <label htmlFor="milestone1"> Point Balance coming soon!</label>
                    </div>
                    <div className="checkbox-item">
                        <input type="checkbox" id="milestone2" />
                        <label htmlFor="milestone2"> Point Balance coming soon!</label>
                    </div>
                    <div className="checkbox-item">
                        <input type="checkbox" id="milestone3" />
                        <label htmlFor="milestone3"> Point Balance coming soon!</label>
                    </div>
                </div>
            </div>


            {/* Avatars Area */}
            <div className="avatars-container">
                    <div className="avatars-text">Avatars</div>
                    <div className="avatars-area">
                        {[...Array(8)].map((_, index) => (
                            <button key={index} className="avatar-item" onClick={handleAvatarsClick}>
                                <img
                                    src={`https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/louiszen/build/images/avatars/image%20${index + 1}.png`}
                                    alt={`Avatar ${index + 1}`}
                                />
                            </button>
                        ))}
                    </div>
            </div>
            
            {/* Themes Area */}
            <div className="themes-container">
                <div className="themes-text">Themes</div>
                <div className="themes-area">
                    {[
                        { color: '#A07856', locked: true }, // Brown
                        { color: '#A9A9A9', locked: true }, // Grey
                        { color: '#0000FF', locked: true },  // Blue
                        { color: '#FF0000', locked: true },  // Red
                        { color: '#FFFFFF', locked: true }, // White 
                        { color: '#B2FBA5', locked: true },  // Light Green
                        { color: '#FFB6C1', locked: true },  // Pink 
                        { color: '#228B22', locked: true },  // Green
                    ].map((theme, index) => (
                        <button
                            key={index}
                            className="theme-item"
                            style={{ backgroundColor: theme.color }}
                            onClick={handleThemesClick}
                        >
                            {theme.locked && (
                                <img
                                    className="lock-icon"
                                    src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/louiszen/build/images/avatars/Frame.png"
                                    alt="Lock Icon"
                                    
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>


        </div>
    </div>
    );
};

export default Rewards;
