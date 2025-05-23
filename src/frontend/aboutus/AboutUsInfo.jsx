/**
 * @file AboutUsInfo.jsx
 * @description A React component that displays information about the "BBY12" team,
 * including a team description and a list of team members with their roles.
 * It uses Framer Motion for animations.
 */

// Import `motion` from framer-motion for creating animated components.
import { motion } from 'framer-motion';

// Import a generic team icon (presumably an SVG or image file).
// The path suggests it's located in an 'assets' directory relative to the current file's parent.
import teamIcon from '../../assets/team_icon.svg';

/**
 * @constant {object} fadeInUp
 * @description A Framer Motion variant object used for "fade in up" animations.
 * @property {object} hidden - The initial state of the animation (opacity 0, translated 30px down).
 * @property {function} visible - The target state of the animation (opacity 1, original y-position).
 *                                It accepts an optional `i` parameter for staggered delays.
 */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 }, // Initial state: invisible and shifted down
  visible: (i = 1) => ({         // Target state: visible and at original y-position
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,          // Staggered delay based on the custom `i` prop
      duration: 0.6,            // Animation duration
      ease: 'easeOut',          // Easing function for a smooth effect
    }
  })
};

/**
 * @function AboutUsInfo
 * @description A React functional component that renders the "About Us" section.
 * It displays a description of the team and a list of team members.
 * Animations are applied to the content blocks and individual team members.
 *
 * @returns {JSX.Element} The rendered AboutUsInfo component.
 */
function AboutUsInfo() {
  /**
   * @const {Array<object>} team
   * @description An array of objects, where each object represents a team member.
   * @property {string} name - The name of the team member.
   * @property {string} role - The role or identifier of the team member (e.g., "Team Member 1").
   * @property {string} image - The path to the team member's image (currently uses a generic `teamIcon`).
   */
  const team = [
    { name: "Valley Balfour", role: "Team Member 1", image: teamIcon },
    { name: "Dominic Cheang", role: "Team Member 2", image: teamIcon},
    { name: "Tyrone Cheang", role: "Team Member 3", image: teamIcon },
    { name: "Isaac Kehler", role: "Team Member 4", image: teamIcon },
    { name: "Bullen Kosa", role: "Team Member 5", image: teamIcon },
  ];

  return (
    // Main container for the "About Us" section with vertical padding.
    <div className="py-24 sm:py-32">
      {/* Centered content area with max width, padding, and a grid layout for responsiveness. */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid gap-10 xl:grid-cols-3">

        {/* Left content block: Team description. */}
        <motion.div
          // Styling for the description card: background, border, hover effect, padding, rounded corners, shadow.
          className="bg-[#232323] border border-gray-800 hover:border-blue-400/30 p-8 rounded-2xl shadow-md max-w-xl transition-colors duration-300"
          initial="hidden" // Initial animation state (from `fadeInUp` variant)
          whileInView="visible" // Animate to "visible" state when the element enters the viewport
          viewport={{ once: true }} // Animation runs only once when it enters the viewport
          variants={fadeInUp} // Use the `fadeInUp` animation variants
          custom={0} // Custom prop for `fadeInUp.visible` (delay multiplier)
        >
          {/* Team name/title. */}
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Meet BBY12</h2>
          {/* Team description paragraph. */}
          <p className="mt-6 text-lg text-white">
            We’re a team of BCIT students passionate about tech and television, working together to build a social app that helps users track episodes, share their favorite shows, and connect with fellow fans. Our goal is to create a standout, user-friendly experience that goes beyond a school project. Something we’re proud to share with real users.
          </p>
        </motion.div>

        {/* Right content block: List of team members. Spans 2 columns on extra-large screens. */}
        <motion.div
          // Styling for the team members card.
          className="bg-[#232323] border border-gray-800 hover:border-blue-400/30 p-8 rounded-2xl shadow-md xl:col-span-2 transition-colors duration-300"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={0.3} // Slightly delayed animation compared to the description block
        >
          {/* Unordered list for team members, styled as a responsive grid. */}
          <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Map over the `team` array to render each team member. */}
            {team.map((person, index) => (
              // List item for each team member with individual animation.
              <motion.li
                key={index} // Unique key for each list item
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                custom={0.4 + index * 0.7} // Staggered delay for each team member appearing
              >
                {/* Flex container for the team member's image and details. */}
                <div className="flex items-center gap-x-6">
                  {/* Team member's image. */}
                  <img
                    className="size-20 rounded-full" // Styling for size and rounded shape
                    src={person.image}
                    alt={person.name}
                  />
                  {/* Container for team member's name and role. */}
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-white">{person.name}</h3>
                    <p className="text-sm font-semibold text-blue-600">{person.role}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

// Export the AboutUsInfo component as the default export of this module.
export default AboutUsInfo;