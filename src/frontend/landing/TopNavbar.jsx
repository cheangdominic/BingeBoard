/**
 * @file TopNavbar.jsx
 * @description A React component for the top navigation bar, typically used on landing pages
 * or for unauthenticated users. It includes navigation links, a logo, and a mobile-responsive menu
 * with an FAQ panel.
 * This component uses Headless UI for accessible UI components like Dialog and Disclosure.
 */

// The "use client" directive is specific to Next.js and indicates that this component
// should be rendered on the client-side. For a standard React app, this line is not needed
// and might cause issues if not handled by a specific framework.
"use client";

// Import useState hook from React for managing component state.
import { useState } from "react";
// Import components from Headless UI for accessible dialogs (modals) and disclosures (accordions).
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  PopoverGroup, // PopoverGroup is imported but not explicitly used in this version of the code.
                 // It's often used for dropdown menus in desktop navigation.
} from "@headlessui/react";
// Import icons (Bars3Icon for menu, XMarkIcon for close) from Heroicons (outline version).
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
// Import ChevronDownIcon from Heroicons (solid version), used for disclosure panels.
import {
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
// Import the application logo image.
import logo from "../../assets/BingeBoard Icon.svg";

/**
 * @function TopNavbar
 * @description A React functional component that renders the main top navigation bar.
 * It includes links for account creation, browsing, FAQs, about us, and login.
 * It features a responsive design with a collapsible mobile menu and an FAQ side panel.
 *
 * @returns {JSX.Element} The rendered TopNavbar component.
 */
export default function TopNavbar() {
  // State to control the visibility of the mobile menu.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // State to control the visibility of the FAQ information panel.
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  // Array of FAQ objects, each with a question and an answer.
  const faqs = [
    {
      question: "What is BingeBoard?",
      answer:
        "BingeBoard is a social platform for TV lovers. You can log the shows you watch, rate them, leave reviews, and discover what others are watching. It's like Letterboxd, but for TV.",
    },
    {
      question: "Is BingeBoard free to use?",
      answer:
        "Yes! BingeBoard is completely free to use. Optional premium features may be introduced in the future.",
    },
    {
      question: "How do I create an account?",
      answer:
        "Click the 'Create Account' button in the top navigation bar and fill in the required details like email, username, and password.",
    },
    {
      question: "How do I reset my password?",
      answer:
        'Go to the login page and click on "Forgot Password?" above the password input. We’ll send you a reset link via email.',
    },
    {
      question: "Is there a mobile app?",
      answer:
        "A mobile version is in development! In the meantime, BingeBoard works great on mobile browsers.",
    },
    {
      question: "How do I find new shows to watch?",
      answer:
        "You can browse trending shows, explore curated lists, or see what your friends are watching and recommending.",
    },
    {
      question: "Can I track which episodes I've watched?",
      answer:
        "Absolutely! You can mark episodes as watched, track your progress through seasons, and get notified when new episodes air.",
    },
    {
      question: "Can I track which episode I'm on for each show?",
      answer:
        "Yes! Each show's page includes a progress tracker where you can mark off episodes as you watch them.",
    },
    {
      question: "Can I write reviews and rate shows?",
      answer:
        "Yes! You can rate shows and seasons, and write short or long-form reviews to share your thoughts with the community.",
    },
    {
      question: "How are show ratings calculated?",
      answer:
        "Ratings are based on user submissions. We use an average of all ratings, weighted slightly to reduce spam or manipulation.",
    },
    {
      question: "Can I share my profile with friends?",
      answer:
        "Of course! Every user has a public profile link you can share. Friends can see your reviews, watch history, and lists.",
    },
    {
      question: "Can I see release dates for upcoming episodes?",
      answer:
        "Yes! Show pages include episode guides with air dates, including upcoming episodes so you can plan your binge.",
    },
  ];

  // Render the header and navigation.
  return (
    // Header element, styled as sticky at the top with background and shadow.
    // Z-index is adjusted based on mobile menu state to ensure proper layering.
    <header
      className={`bg-[#1A1A1A] sticky top-0 shadow-2xl shadow-black/60 ${mobileMenuOpen ? "z-40" : "z-50" // Lower z-index when mobile menu is open to allow Dialog to be on top
        }`}
    >
      {/* Main navigation container, centered with max width and padding. */}
      <nav
        aria-label="Global" // Accessibility label for the navigation.
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        {/* Left section of the navbar: Logo and application name. */}
        <div className="flex items-center lg:flex-1"> {/* `lg:flex-1` allows it to take up space on large screens. */}
          <a href="/" className="-m-1.5 p-1.5 flex items-center space-x-2"> {/* Link to homepage. */}
            <img
              alt="BingeBoard logo"
              src={logo} // Application logo image.
              className="h-10 w-auto" // Logo size.
            />
            {/* Application name text. */}
            <span className="text-white text-3xl font-bold hover:text-blue-400 transition">
              BingeBoard
            </span>
          </a>
        </div>
        {/* Mobile menu button (hamburger icon), visible only on small screens (`lg:hidden`). */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)} // Opens the mobile menu dialog.
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700" // Styling.
          >
            <span className="sr-only">Open main menu</span> {/* Screen-reader only text. */}
            <Bars3Icon aria-hidden="true" className="size-6 text-white" /> {/* Menu icon. */}
          </button>
        </div>
        {/* Desktop navigation links, hidden on small screens (`hidden lg:flex`). */}
        <PopoverGroup className="hidden lg:flex lg:gap-x-12"> {/* `PopoverGroup` is for Headless UI Popovers, but used here just as a div effectively. */}
          <a
            href="/signup" // Link to signup page.
            className="text-sm/6 font-semibold text-[#ffffff] hover:text-blue-400 transition"
          >
            Create Account
          </a>
          <a
            href="/browse" // Link to browse page.
            className="text-sm/6 font-semibold text-[#ffffff] hover:text-blue-400 transition"
          >
            Browse
          </a>
          {/* FAQ button that toggles the infoPanelOpen state. */}
          <button
            onClick={function () {
              // Toggle the FAQ panel's visibility.
              if (infoPanelOpen) {
                setInfoPanelOpen(false);
              } else {
                setInfoPanelOpen(true);
              }
            }}
            className="text-white hover:text-blue-400 transition font-semibold"
          >
            FAQ
          </button>

          {/* FAQ side panel for desktop view. Slides in from the left. */}
          <div
            // Dynamic class for translation based on `infoPanelOpen` state.
            className={`fixed mt-14 left-0 z-50 w-80 transform bg-[#1e1e1e] shadow-xl transition-transform duration-300 ease-in-out ${infoPanelOpen ? "translate-x-0" : "-translate-x-full" // Slides in/out
              }`}
            style={{ // Inline styles for scrollability and max height.
              overflowY: "auto",
              maxHeight: "44.5rem", // Limit height to prevent overly long panel.
            }}
          >
            {/* Header for the FAQ panel. */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">FAQ</h2>
              <button
                onClick={() => setInfoPanelOpen(false)} // Close button.
                className="text-white hover:text-red-400 transition"
              >
                ✕ {/* Close icon (times symbol). */}
              </button>
            </div>

            {/* Container for FAQ items, using Headless UI Disclosure for accordion behavior. */}
            <div className="p-4 text-white space-y-2">
              {faqs.map((faq, index) => (
                <Disclosure key={index}> {/* Each FAQ item is a Disclosure component. */}
                  {({ open }) => ( // Render prop provides `open` state of the disclosure.
                    <>
                      {/* Button to toggle the disclosure panel. */}
                      <DisclosureButton className="w-full flex justify-between items-center rounded bg-[#2e2e2e] px-4 py-2 text-left hover:bg-[#3a3a3a] transition">
                        <span>{faq.question}</span>
                        <ChevronDownIcon // Arrow icon that rotates based on `open` state.
                          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : "" // Rotate icon when open
                            }`}
                        />
                      </DisclosureButton>
                      {/* Panel containing the answer, shown when disclosure is open. */}
                      <DisclosurePanel className="px-4 py-2 text-gray-300 bg-[#1a1a1a]">
                        {faq.answer}
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              ))}
            </div>
          </div>

          <a
            href="/aboutus" // Link to About Us page.
            className="text-sm/6 font-semibold text-[#ffffff] hover:text-blue-400 transition"
          >
            About Us
          </a>
        </PopoverGroup>
        {/* Right section of the desktop navbar: Log In link. */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end"> {/* `lg:flex-1` allows it to take space, `lg:justify-end` aligns content to the right. */}
          <a
            href="/login" // Link to login page.
            className="text-sm/6 font-semibold text-[#ffffff] hover:text-blue-400 transition"
          >
            Log In <span aria-hidden="true">→</span> {/* Arrow icon. */}
          </a>
        </div>
      </nav>
      {/* Mobile menu Dialog (modal), controlled by `mobileMenuOpen` state. */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen} // Function to close the dialog.
        className="lg:hidden" // Only visible on small screens.
      >
        {/* Overlay for the dialog. */}
        <div className="fixed inset-0 z-40 bg-black/50" />
        {/* Panel containing the mobile menu content. Slides in from the right. */}
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#1e1e1e] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          {/* Header for the mobile menu: Logo and close button. */}
          <div className="flex items-center justify-between">
            <a href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
              <img
                alt="BingeBoard logo"
                src="src/assets/BingeBoard Icon.svg" // Note: Path might need adjustment depending on build process. Consider importing like `logo`.
                className="h-8 w-auto"
              />
              <span className="text-white text-xl font-bold">
                BingeBoard
              </span>
            </a>
            {/* Button to close the mobile menu. */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-[#ECE6DD]"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" /> {/* Close icon. */}
            </button>
          </div>
          {/* Main content area of the mobile menu. */}
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y text-[#ffffff]"> {/* Divider for sections. */}
              {/* Navigation links section. */}
              <div className="space-y-2 py-6">
                <a
                  href="/signup"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-[#ffffff] hover:bg-[#2E2E2E] transition"
                >
                  Create Account
                </a>
                <a
                  href="/browse"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-[#ffffff] hover:bg-[#2E2E2E] transition"
                >
                  Browse
                </a>

                {/* FAQ button for mobile, toggles the same `infoPanelOpen` state. */}
                <button
                  onClick={function () {
                    if (infoPanelOpen) {
                      setInfoPanelOpen(false);
                    } else {
                      setMobileMenuOpen(false); // Close mobile menu first
                      setInfoPanelOpen(true);  // Then open FAQ panel
                    }
                  }}
                  className="text-white hover:text-blue-400 transition font-semibold w-full text-left -mx-3 block rounded-lg px-3 py-2 text-base/7" // Styled to look like other links
                >
                  FAQ
                </button>

                {/* FAQ Panel for Mobile View - This version overlays the entire screen when active.
                    It might be better to have a separate modal or a different presentation for mobile FAQs
                    if the desktop slide-in panel is not desired on mobile.
                    The current implementation will make the FAQ panel cover the mobile menu if both are triggered.
                    A common pattern is to link to a separate FAQ page or integrate FAQs within the mobile menu itself
                    using Disclosures without a separate full-screen panel.
                    The logic `setMobileMenuOpen(false); setInfoPanelOpen(true);` suggests an attempt to switch views.
                */}
                <div
                  className={`fixed top-0 left-0 z-50 w-full bg-[#1e1e1e] shadow-xl transition-transform duration-300 ease-in-out ${infoPanelOpen ? "translate-x-0" : "-translate-x-full"
                    }`} // This panel will cover the mobile nav if `infoPanelOpen` is true
                  style={{
                    height: "100vh", // Full viewport height
                    overflowY: "auto", // Scrollable
                  }}
                >
                  {/* Custom scrollbar styles for the FAQ panel (primarily for WebKit browsers). */}
                  <style>
                    {`
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-thumb {
        background-color: #4a4a4a; /* Scrollbar thumb color */
        border-radius: 4px;       /* Rounded corners for thumb */
        border: 2px solid #1e1e1e; /* Border around thumb (creates padding effect) */
      }

      ::-webkit-scrollbar-track {
        background-color: #2e2e2e; /* Scrollbar track color */
        border-radius: 4px;       /* Rounded corners for track */
      }
    `}
                  </style>

                  {/* Header for the mobile FAQ panel. */}
                  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">FAQ</h2>
                    <button
                      onClick={() => setInfoPanelOpen(false)} // Close FAQ panel
                      className="text-white hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>

                  {/* FAQ items using Disclosure components. */}
                  <div className="p-4 text-white space-y-2">
                    {faqs.map((faq, index) => (
                      <Disclosure key={index}>
                        {({ open }) => (
                          <>
                            <DisclosureButton className="w-full flex justify-between items-center rounded bg-[#2e2e2e] px-4 py-2 text-left hover:bg-[#3a3a3a] transition">
                              <span>{faq.question}</span>
                              <ChevronDownIcon
                                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""
                                  }`}
                              />
                            </DisclosureButton>
                            <DisclosurePanel className="px-4 py-2 text-gray-300 bg-[#1a1a1a]">
                              {faq.answer}
                            </DisclosurePanel>
                          </>
                        )}
                      </Disclosure>
                    ))}
                  </div>
                </div>

                <a
                  href="/aboutus"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-[#ffffff] hover:bg-[#2E2E2E] transition"
                >
                  About Us
                </a>
              </div>
              {/* Log In link section. */}
              <div className="py-6">
                <a
                  href="/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-[#ffffff] hover:bg-[#2E2E2E] transition"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}