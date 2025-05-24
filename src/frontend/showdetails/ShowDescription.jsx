/**
 * @file ShowDescription.js
 * @description A React component that displays the description or synopsis of a TV show.
 * It adjusts its bottom margin based on the length of the description.
 */

/**
 * @function ShowDescription
 * @description A stateless functional React component that renders the description of a TV show.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.show - The TV show object.
 * @param {string} [props.show.description] - The description/synopsis of the TV show.
 *                                            If not provided, a default message is displayed.
 * @returns {JSX.Element} The rendered ShowDescription component.
 */
const ShowDescription = ({ show }) => {
  /**
   * The length of the show's description string. Defaults to 0 if description is not available.
   * `?.` optional chaining is used to safely access `length`.
   * @const {number}
   */
  const descriptionLength = show.description?.length || 0;
  /**
   * Boolean indicating if the description is considered short.
   * This is used to conditionally apply a smaller bottom margin.
   * The threshold (200 characters) can be adjusted as needed.
   * @const {boolean}
   */
  const isShortDescription = descriptionLength < 200; // Adjust this threshold as needed

  // Render the show description section.
  return (
    // Main container for the description, with styling for background, rounded corners, padding, shadow, and dynamic bottom margin.
    // The bottom margin (`mb-4` or `mb-8`) changes based on `isShortDescription`.
    <div className={`bg-[#2a2a2a] rounded-xl p-6 shadow-lg ${isShortDescription ? 'mb-4' : 'mb-8'}`}>
      {/* Section title "Synopsis". */}
      <h2 className="text-xl font-bold mb-4 text-gray-100">
        Synopsis
      </h2>   
      {/* Paragraph displaying the show's description.
          If `show.description` is not provided, a default message "No description available." is shown.
          Styled for text color, responsive font size, and line height for readability. */}
      <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
        {show.description || 'No description available.'}
      </p>
    </div>
  );
};

// Export the ShowDescription component as the default export of this module.
export default ShowDescription;