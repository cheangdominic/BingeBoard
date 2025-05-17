import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Apple } from "lucide-react";

const PartialApple = ({ fillPercent }) => (
  <div className="relative w-10 h-10 inline-block group">
    <Apple className="absolute top-0 left-0 w-10 h-10 text-gray-400" />
    <div
      className="absolute top-0 left-0 h-10 overflow-hidden"
      style={{ width: `${fillPercent}%` }}
    >
      <motion.div whileHover={{ scale: 1.2 }} className="w-6 h-6">
        <Apple className="w-10 h-10 text-yellow-500 fill-yellow-500" />
      </motion.div>
    </div>
  </div>
);

function AppleRating({ rating = 0, onClickApple = null }) {
  const fullApples = Math.floor(rating);
  const partialFillPercent = (rating - fullApples) * 100;
  const hasPartialApple = partialFillPercent > 0;
  const emptyApples = 5 - fullApples - (hasPartialApple ? 1 : 0);

  return (
    <div className="flex gap-1 mb-2">
      {Array.from({ length: fullApples }).map((_, idx) => (
        <motion.div key={`full-${idx}`} whileHover={{ scale: 1.2 }}>
          <Apple
            className="w-10 h-10 text-yellow-500 fill-yellow-500 cursor-pointer"
            onClick={() => onClickApple && onClickApple(idx + 1)}
          />
        </motion.div>
      ))}
      {hasPartialApple && (
        <motion.div
          onClick={() => onClickApple && onClickApple(fullApples + 1)}
          whileHover={{ scale: 1.2 }}
        >
          <PartialApple fillPercent={partialFillPercent} />
        </motion.div>
      )}
      {Array.from({ length: emptyApples }).map((_, idx) => (
        <motion.div key={`empty-${idx}`} whileHover={{ scale: 1.2 }}>
          <Apple
            className="w-10 h-10 text-gray-400 cursor-pointer"
            onClick={() =>
              onClickApple &&
              onClickApple(fullApples + (hasPartialApple ? 1 : 0) + idx + 1)
            }
          />
        </motion.div>
      ))}
    </div>
  );
}


const LogReview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedShow } = location.state || {};

    const [reviewText, setReviewText] = useState("");
    const [containsSpoilers, setContainsSpoilers] = useState(false);
    const [ratingWhole, setRatingWhole] = useState(0);
    const [ratingDecimal, setRatingDecimal] = useState(0);
    const [tagsInput, setTagsInput] = useState("");
    const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

    useEffect(() => {
        if (ratingWhole >= 5) {
        setRatingDecimal(0);
        }
    }, [ratingWhole]);

    const handleAppleClick = (appleNumber) => {
        setRatingWhole(appleNumber);
        if (appleNumber >= 5) {
        setRatingDecimal(0);
        }
    };

    return (
        <div className="w-[100vw] overflow-y-auto bg-zinc-900 rounded-xl p-6 pt-3 pb-3 shadow-xl text-white flex-shrink-0">
            <h2 className="text-xl font-bold mb-1.5">{selectedShow.name}</h2>
            <img
                src={
                    selectedShow.poster_path
                        ? IMAGE_BASE_URL + selectedShow.poster_path
                        : "https://via.placeholder.com/500x750?text=No+Image"
                }
                alt={selectedShow.name}
                className="w-full rounded-lg mb-2"
                style={{ maxHeight: "100vh", objectFit: "cover" }}
            />
            <div className="space-y-2.5">
                <div>
                    <label className="block mb-1 font-semibold text-lg">Review</label>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="bg-zinc-800 rounded-md p-1.5 w-full text-gray-200 text-md"
                        rows={3}
                        placeholder="Write your thoughts..."
                    />
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            type="checkbox"
                            id="spoiler-checkbox"
                            checked={containsSpoilers}
                            onChange={(e) => setContainsSpoilers(e.target.checked)}
                            className="form-checkbox h-8 w-8 text-yellow-500 bg-zinc-800 border-zinc-600"
                        />
                        <label
                            htmlFor="spoiler-checkbox"
                            className="text-lg text-gray-300 select-none font-semibold"
                        >
                            Contains Spoilers
                        </label>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="block mb-1 font-semibold text-lg">Rating</label>
                    <AppleRating
                        rating={ratingWhole + ratingDecimal / 100}
                        onClickApple={handleAppleClick}
                        style={{ scale: 0.85 }}
                    />
                    <div className="flex items-center gap-1.5 mt-1 pb-3">
                        <input
                            type="number"
                            min={0}
                            max={5}
                            value={ratingWhole}
                            onFocus={() => {
                                if (ratingWhole === 0) setRatingWhole("");
                            }}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                    setRatingWhole("");
                                } else {
                                    const numericValue = Number(value);
                                    if (!isNaN(numericValue) && numericValue <= 5) {
                                        setRatingWhole(numericValue);
                                    }
                                }
                            }}
                            onBlur={() => {
                                if (ratingWhole === "" || ratingWhole === null) {
                                    setRatingWhole(0);
                                }
                            }}
                            className="bg-zinc-800 p-1 rounded-md text-gray-200 w-10 text-center text-lg"
                        />
                        <span className="text-gray-200 text-lg font-bold select-none">.</span>
                        <input
                            type="number"
                            min={0}
                            max={99}
                            value={ratingDecimal}
                            onFocus={() => {
                                if (ratingDecimal === 0) setRatingDecimal("");
                            }}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                    setRatingDecimal("");
                                } else {
                                    const numericValue = Number(value);
                                    if (!isNaN(numericValue) && numericValue <= 99) {
                                        setRatingDecimal(numericValue);
                                    }
                                }
                            }}
                            onBlur={() => {
                                if (ratingDecimal !== "" && ratingDecimal < 10) {
                                    setRatingDecimal(ratingDecimal * 10);
                                }
                                if (ratingDecimal === "") {
                                    setRatingDecimal(0);
                                }
                            }}
                            disabled={ratingWhole >= 5}
                            className={`bg-zinc-800 p-1 rounded-md text-gray-200 w-14 text-center text-lg ${ratingWhole >= 5 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        />
                    </div>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-sm">Tags</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="bg-zinc-800 rounded-md p-1.5 pt-2 pb-2 mb-4 w-full text-gray-200 text-sm"
                    placeholder="e.g., Comedy, Drama"
                  />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="mt-2 w-full py-2 bg-[#1963da] text-white rounded-lg hover:bg-[#1652b5] transition-colors text-sm font-semibold"
                >
                    Submit
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(-1)}
                    className="mt-2 w-full py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors text-sm font-semibold"
                >
                    Cancel
                </motion.button>
            </div>
        </div>
    );
};

export default LogReview;
