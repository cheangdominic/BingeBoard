"use client";

import { useState } from "react";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  PopoverGroup,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import logo from "../../assets/BingeBoard Icon.svg";

export default function TopNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

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

  return (
    <header
      className={`bg-[#1A1A1A] sticky top-0 shadow-2xl shadow-black/60 ${mobileMenuOpen ? "z-40" : "z-50"
        }`}
    >
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex items-center lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <img
              alt="BingeBoard logo"
              src={logo}
              className="h-10 w-auto"
            />
            <span className="text-white text-3xl font-bold hover:text-blue-400 transition">
              BingeBoard
            </span>
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6 text-white" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <a
            href="/signup"
            className="text-sm/6 font-semibold text-[#ffffff] hover:text-blue-400 transition"
          >
            Create Account
          </a>
          <a
            href="/browse"
            className="text-sm/6 font-semibold text-[#ffffff] hover:text-blue-400 transition"
          >
            Browse
          </a>
          <button
            onClick={function () {
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

          <div
            className={`fixed mt-14 left-0 z-50 w-80 transform bg-[#1e1e1e] shadow-xl transition-transform duration-300 ease-in-out ${infoPanelOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            style={{
              overflowY: "auto",
              maxHeight: "44.5rem",
            }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">FAQ</h2>
              <button
                onClick={() => setInfoPanelOpen(false)}
                className="text-white hover:text-red-400 transition"
              >
                ✕
              </button>
            </div>

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
            className="text-sm/6 font-semibold text-[#ffffff] hover:text-blue-400 transition"
          >
            About Us
          </a>
        </PopoverGroup>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a
            href="/login"
            className="text-sm/6 font-semibold text-[#ffffff] hover:text-blue-400 transition"
          >
            Log In <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-40 bg-black/50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#1e1e1e] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
              <img
                alt="BingeBoard logo"
                src="src/assets/BingeBoard Icon.svg"
                className="h-8 w-auto"
              />
              <span className="text-white text-xl font-bold">
                BingeBoard
              </span>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-[#ECE6DD]"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y text-[#ffffff]">
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

                <button
                  onClick={function () {
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

                <div
                  className={`fixed top-0 left-0 z-50 w-full bg-[#1e1e1e] shadow-xl transition-transform duration-300 ease-in-out ${infoPanelOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                  style={{
                    height: "100vh",
                    overflowY: "auto",
                  }}
                >
                  <style>
                    {`
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-thumb {
        background-color: #4a4a4a;
        border-radius: 4px;
        border: 2px solid #1e1e1e;
      }

      ::-webkit-scrollbar-track {
        background-color: #2e2e2e;
        border-radius: 4px;
      }
    `}
                  </style>

                  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">FAQ</h2>
                    <button
                      onClick={() => setInfoPanelOpen(false)}
                      className="text-white hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>

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
