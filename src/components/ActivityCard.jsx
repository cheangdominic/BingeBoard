import React, { useState } from "react";
import { Link } from "react-router-dom";
import TVShowCard from "./TVShowCard";

function ActivityCard({ showName, date, reviewText, rating, imageUrl, showLink }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="w-full mx-2 sm:mx-5 bg-[#2E2E2E] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4 border border-gray-700/50 hover:border-blue-400/30 transition duration-300 shadow-md">
            <div className="flex-1">
                <div className="mb-2">
                    <p className="text-blue-400 text-xl sm:text-2xl font-semibold leading-tight">{showName}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{date}</p>
                </div>

                <p
                    className={`text-[#ECE6DD] text-sm sm:text-base leading-relaxed ${
                        !expanded ? "line-clamp-3" : ""
                    }`}
                    onClick={() => setExpanded(!expanded)}
                >
                    {reviewText}
                </p>

                <div className="flex mt-2 text-yellow-400 text-lg">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span key={i}>{i < rating ? "★" : "☆"}</span>
                    ))}
                </div>
            </div>

            <Link to={showLink} className="flex-shrink-0 hover:scale-105 transition-transform duration-200">
                <TVShowCard imageUrl={imageUrl} size="md" />
            </Link>
        </div>
    );
}

export default ActivityCard;
