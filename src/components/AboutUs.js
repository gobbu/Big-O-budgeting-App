import React, { useState } from 'react';
import './AboutUs.css';

const teamMembers = [
    { name: 'Guo Wei', image: 'https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/alee76/build/images/guoweixu.jpg' },
    { name: 'Louis Zeng', image: 'https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/alee76/build/images/louiszen.jpg' },
    { name: 'Andy Lee', image: 'https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/alee76/build/images/alee76.jpg' },
    { name: 'Ryan Cao', image: 'https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/alee76/build/images/ryancao.jpg' },
    { name: 'Wesley Meah', image: 'https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/alee76/build/images/wesleyme.jpg' },
];

const AboutUs = ({setCurrentPage}) => {
    return (
        <div className="about-us-container">
          <h1 className="about-us-title">About Us</h1>
          <div className="about-us-story">
            <h2>Our Story:</h2>
            <p>
            What began as a simple idea—to create an intuitive budgeting app—has grown
            into a platform that puts you in control. Our team saw the need for a tool
            that not only tracks expenses but also visualizes your progress in a way
            that feels rewarding and motivating. <br />
            Since our launch, we've helped hundreds of users build better financial
            habits, and we’re just getting started.
            </p>
          </div>
          <div className="team-members">
            {teamMembers.map((member, index) => (
              <div className="team-member" key={index}>
                <img src={member.image} alt={member.name} className="member-image" />
                <p className="member-name">{member.name}</p>
              </div>
            ))}
          </div>
    
          {/* Back to Login Button */}
          <button
            className="back-to-login-button"
            onClick={() => setCurrentPage('login')}
          >
            Back to Login
          </button>
        </div>
      );
};

export default AboutUs;