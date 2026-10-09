"use client";

import React, { useState } from "react";
import { InfoCard } from "@/components/InfoCard";

const DAYS = [
  { day: 1, title: "Sign Up" },
  { day: 2, title: "Credit Card Checkout" },
  { day: 3, title: "Landing Page (Above the Fold)" },
  { day: 4, title: "Calculator" },
  { day: 5, title: "App Icon" },
  { day: 6, title: "User Profile" },
  { day: 7, title: "Settings" },
  { day: 8, title: "404 Page" },
  { day: 9, title: "Music Player" },
  { day: 10, title: "Social Share" },
  { day: 11, title: "Flash Message (Success / Error)" },
  { day: 12, title: "E-Commerce Single Item" },
  { day: 13, title: "Direct Messaging / Chat" },
  { day: 14, title: "Countdown Timer" },
  { day: 15, title: "Onboarding Flow" },
  { day: 16, title: "Pop-Up / Overlay" },
  { day: 17, title: "Email Receipt" },
  { day: 18, title: "Analytics Chart" },
  { day: 19, title: "Leaderboard" },
  { day: 20, title: "Location Tracker / Map" },
  { day: 21, title: "Home Monitoring / Smart Home" },
  { day: 22, title: "Search Component" },
  { day: 23, title: "On/Off Switch" },
  { day: 24, title: "Boarding Pass" },
  { day: 25, title: "TV App Interface" },
  { day: 26, title: "Subscribe Form" },
  { day: 27, title: "Dropdown Menu" },
  { day: 28, title: "Contact Us Form" },
  { day: 29, title: "Map View / Pin Drop" },
  { day: 30, title: "Pricing Table" },
  { day: 31, title: "File Upload UI" },
  { day: 32, title: "Crowdfunding Campaign" },
  { day: 33, title: "Customize Product" },
  { day: 34, title: "Car Interface / Dashboard" },
  { day: 35, title: "Blog Post / Article" },
  { day: 36, title: "Special Offer / Coupon" },
  { day: 37, title: "Weather App Interface" },
  { day: 38, title: "Calendar / Date Picker" },
  { day: 39, title: "Testimonials Carousel" },
  { day: 40, title: "Recipe UI" },
  { day: 41, title: "Workout / Fitness App" },
  { day: 42, title: "To-Do List / Task Management" },
  { day: 43, title: "Food / Meal Tracker" },
  { day: 44, title: "Favorite / Bookmark Action" },
  { day: 45, title: "Info Card / Preview Card" },
  { day: 46, title: "Invoice UI" },
  { day: 47, title: "Activity Feed" },
  { day: 48, title: "Search Results" },
  { day: 49, title: "Notifications Center" },
  { day: 50, title: "Job Board / Job Listing" },
  { day: 51, title: "Press Page" },
  { day: 52, title: "Dashboard" },
  { day: 53, title: "Header Navigation" },
  { day: 54, title: "Confirm Confirmation" },
  { day: 55, title: "Icon Set" },
  { day: 56, title: "Breadcrumbs" },
  { day: 57, title: "Video Player" },
  { day: 58, title: "Shopping Cart" },
  { day: 59, title: "Background Pattern" },
  { day: 60, title: "Workspace / File Upload" },
  { day: 61, title: "Redeem Coupon" },
  { day: 62, title: "Workout Tracker" },
  { day: 63, title: "Best of 20XX / Recap" },
  { day: 64, title: "User Types / Personas" },
  { day: 65, title: "Notes Widget" },
  { day: 66, title: "Statistics / Analytics" },
  { day: 67, title: "Hotel Booking" },
  { day: 68, title: "Flight Search" },
  { day: 69, title: "Trending Topics" },
  { day: 70, title: "Event Listing" },
  { day: 71, title: "Scheduling / Calendar" },
  { day: 72, title: "Image Slider" },
  { day: 73, title: "Virtual Reality / Augmented Reality" },
  { day: 74, title: "App Download CTA" },
  { day: 75, title: "Pre-Order Page" },
  { day: 76, title: "Loading / Progress State" },
  { day: 77, title: "Thank You Page" },
  { day: 78, title: "Security / Authentication" },
  { day: 79, title: "Itinerary Builder" },
  { day: 80, title: "Date Picker" },
  { day: 81, title: "Status Update / Feed Post" },
  { day: 82, title: "Form Validation State" },
  { day: 83, title: "Badge / Achievement" },
  { day: 84, title: "Badge / Trophy Collection" },
  { day: 85, title: "Pagination Component" },
  { day: 86, title: "Tooltip" },
  { day: 87, title: "Tool / Utility Bar" },
  { day: 88, title: "Avatar / Profile Customizer" },
  { day: 89, title: "Terms of Service" },
  { day: 90, title: "Create New Project" },
  { day: 91, title: "Curated Collection / List" },
  { day: 92, title: "FAQ Accordion" },
  { day: 93, title: "Splash Screen" },
  { day: 94, title: "News / Content Feed" },
  { day: 95, title: "Product Tour" },
  { day: 96, title: "Interactive Map" },
  { day: 97, title: "Game Center / Match Stats" },
  { day: 98, title: "Advert / Banner" },
  { day: 99, title: "Categories Navigation" },
  { day: 100, title: "Redesign / Daily UI Complete" },
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
