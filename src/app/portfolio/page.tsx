"use client";

import React, { useState } from "react";
import { InfoCard } from "@/components/InfoCard";

const DAYS = [
  { day: 1, title: "Sign Up" },
  { day: 2, title: "Checkout" },
  { day: 3, title: "Landing Page" },
  { day: 4, title: "Calculator" },
  { day: 5, title: "App Icon" },
  { day: 6, title: "User Profile" },
  { day: 7, title: "Settings" },
  { day: 8, title: "404 Page" },
  { day: 9, title: "Music Player" },
  { day: 10, title: "Social Share" },
  { day: 11, title: "Flash Message" },
  { day: 12, title: "Single Product" },
  { day: 13, title: "Direct Messaging" },
  { day: 14, title: "Countdown Timer" },
  { day: 15, title: "Toggle" },
  { day: 16, title: "Pop-Up / Overlay" },
  { day: 17, title: "Email Receipt" },
  { day: 18, title: "Analytics Chart" },
  { day: 19, title: "Leaderboard" },
  { day: 20, title: "Location Tracker" },
  { day: 21, title: "Monitoring Dashboard" },
  { day: 22, title: "Search" },
  { day: 23, title: "Onboarding" },
  { day: 24, title: "Boarding Pass" },
  { day: 25, title: "TV App" },
  { day: 26, title: "Subscribe" },
  { day: 27, title: "Dropdown" },
  { day: 28, title: "Contact Us" },
  { day: 29, title: "Map" },
  { day: 30, title: "Pricing" },
  { day: 31, title: "File Upload" },
  { day: 32, title: "Crowdfunding Campaign" },
  { day: 33, title: "Customize Product" },
  { day: 34, title: "Car Interface" },
  { day: 35, title: "Blog Post" },
  { day: 36, title: "Special Offer" },
  { day: 37, title: "Weather" },
  { day: 38, title: "Calendar" },
  { day: 39, title: "Testimonials" },
  { day: 40, title: "Recipe" },
  { day: 41, title: "Workout Tracker" },
  { day: 42, title: "ToDo List" },
  { day: 43, title: "Food/Drink Menu" },
  { day: 44, title: "Favorites" },
  { day: 45, title: "InfoCard" },
  { day: 46, title: "Invoice" },
  { day: 47, title: "Activity Feed" },
  { day: 48, title: "Coming Soon" },
  { day: 49, title: "Notifications" },
  { day: 50, title: "Job Listing" },
  { day: 51, title: "Press Page" },
  { day: 52, title: "Daily UI Logo" },
  { day: 53, title: "Header Navigation" },
  { day: 54, title: "Confirm Reservation" },
  { day: 55, title: "Icon Set" },
  { day: 56, title: "Breadcrumbs" },
  { day: 57, title: "Video Player" },
  { day: 58, title: "Shopping Cart" },
  { day: 59, title: "Background Pattern" },
  { day: 60, title: "Color Picker" },
  { day: 61, title: "Redeem Coupon" },
  { day: 62, title: "Workout of the Day" },
  { day: 63, title: "Best of 2024" },
  { day: 64, title: "Select User Type" },
  { day: 65, title: "Notes Widget" },
  { day: 66, title: "Statistics" },
  { day: 67, title: "Hotel Booking" },
  { day: 68, title: "Flight Search" },
  { day: 69, title: "Trending" },
  { day: 70, title: "Event Listing" },
  { day: 71, title: "Schedule" },
  { day: 72, title: "Image Slider" },
  { day: 73, title: "Virtual Reality" },
  { day: 74, title: "Download App" },
  { day: 75, title: "Pre-Order" },
  { day: 76, title: "Loading" },
  { day: 77, title: "Thank You" },
  { day: 78, title: "Pending Invitation" },
  { day: 79, title: "Itinerary" },
  { day: 80, title: "Date Picker" },
  { day: 81, title: "Status Update" },
  { day: 82, title: "Form" },
  { day: 83, title: "Button" },
  { day: 84, title: "Badge" },
  { day: 85, title: "Pagination" },
  { day: 86, title: "Progress Bar" },
  { day: 87, title: "Tooltip" },
  { day: 88, title: "Avatar" },
  { day: 89, title: "Terms Of Service" },
  { day: 90, title: "Create New" },
  { day: 91, title: "Curated For You" },
  { day: 92, title: "FAQ" },
  { day: 93, title: "Splash Screen" },
  { day: 95, title: "Product Tour" },
  { day: 96, title: "In Stock" },
  { day: 97, title: "Giveaway" },
  { day: 98, title: "Advertisement" },
  { day: 101, title: "Mobile Menu" },
  { day: 102, title: "Movie Card" },
  { day: 103, title: "Filter Products" },
  { day: 104, title: "Hover State" },
  { day: 105, title: "Newsfeed" },
  { day: 106, title: "Inbox" },
  { day: 107, title: "Currency Converter" },
  { day: 108, title: "Quote" },
  { day: 109, title: "Stroked Illustration" },
  { day: 110, title: "Contact List" },
  { day: 111, title: "Data Download" },
  { day: 112, title: "E-Commerce Shop" },
  { day: 113, title: "News Article" },
  { day: 114, title: "Countdown Timer" },
  { day: 115, title: "Power Setting" },
  { day: 116, title: "Add to Cart" },
  { day: 117, title: "Restart Now" },
  { day: 118, title: "Pet Profiles" },
  { day: 119, title: "Product Features" },
  { day: 120, title: "Profile Export" },
  { day: 121, title: "Messenger" },
  { day: 122, title: "Restaurant Reservation" },
  { day: 123, title: "Crowdfunding Goal" },
  { day: 124, title: "Log In" },
  { day: 125, title: "Social Proof" },
  { day: 126, title: "Map / Wayfinding" },
  { day: 127, title: "Subscription Confirmation" },
  { day: 128, title: "TV Remote" },
  { day: 129, title: "Bike Selection" },
  { day: 130, title: "Confirm Order" },
  { day: 131, title: "Messaging" },
  { day: 132, title: "Dashboard" },
  { day: 133, title: "Accessibility" },
  { day: 134, title: "Playlist" },
  { day: 135, title: "Blog Post Editor" },
  { day: 136, title: "Customizable UI" },
  { day: 137, title: "Autocomplete" },
  { day: 138, title: "Portfolio" },
  { day: 139, title: "Testimonial / Review" },
  { day: 140, title: "Color UI" },
  { day: 141, title: "Continue Sign Up" },
  { day: 142, title: "File Upload" },
  { day: 143, title: "Event Listing" },
  { day: 144, title: "Flash Message" },
  { day: 145, title: "Timeline" },
  { day: 146, title: "Chat" },
  { day: 147, title: "Activity Feed" },
  { day: 148, title: "Weather App" },
  { day: 149, title: "Job Listing" },
  { day: 150, title: "Shopping Cart" },
  { day: 151, title: "Statistics" },
  { day: 152, title: "Step Through" },
  { day: 153, title: "Notification Center" },
  { day: 154, title: "QR Code" },
  { day: 155, title: "Apply For A Job" },
  { day: 156, title: "Edit Profile" },
  { day: 157, title: "Keyboard" },
  { day: 158, title: "Shopping Bag" },
  { day: 159, title: "Date / Time Picker" },
  { day: 160, title: "Product Walkthrough" },
  { day: 161, title: "Bookings" },
  { day: 162, title: "Dining Experience" },
  { day: 163, title: "Progress Bar" },
  { day: 164, title: "Tier List" },
  { day: 165, title: "Photo Studio" },
  { day: 166, title: "Travel Itinerary" },
  { day: 167, title: "Receipt" },
];

const Portfolio = () => {
  const [query, setQuery] = useState("");

  const filteredDays = DAYS.filter((day) => {
    const search = query.trim().toLowerCase();
    if (!search) return true;
    return (
      day.title.toLowerCase().includes(search) ||
      String(day.day).includes(search)
    );
  });

  return (
    <div className="flex h-full w-full justify-center ">
      <div className="m-0 w-full max-w-5xl ">
        <div className="flex justify-center p-10 pb-0">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by day or title..."
            className="w-full max-w-md rounded-full border border-black px-5 py-2 font-sans text-sm outline-none focus:border-black dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex max-w-5xl flex-wrap justify-center gap-5 pt-10">
          {filteredDays.map((day) => (
            <InfoCard key={day.day} day={day.day} title={day.title} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
