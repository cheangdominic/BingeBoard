"use client";

import { useState } from "react";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
} from "@heroicons/react/20/solid";

const products = [
  {
    name: "Analytics",
    description: "Get a better understanding of your traffic",
    href: "#",
    icon: ChartPieIcon,
  },
  {
    name: "Engagement",
    description: "Speak directly to your customers",
    href: "#",
    icon: CursorArrowRaysIcon,
  },
  {
    name: "Security",
    description: "Your customers' data will be safe and secure",
    href: "#",
    icon: FingerPrintIcon,
  },
  {
    name: "Integrations",
    description: "Connect with third-party tools",
    href: "#",
    icon: SquaresPlusIcon,
  },
  {
    name: "Automations",
    description: "Build strategic funnels that will convert",
    href: "#",
    icon: ArrowPathIcon,
  },
];

export default function TopNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={`bg-[#1A1A1A] sticky top-0 shadow-2xl shadow-black/60 ${mobileMenuOpen ? 'z-40' : 'z-50'}`}>
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex items-center lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <img
              alt="BingeBoard logo"
              src="src/assets/BingeBoard Icon.svg"
              className="h-10 w-auto"
            />
            <span className="text-white text-3xl font-bold font-coolvetica hover:text-blue-400 transition">
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
            className="text-sm/6 font-semibold font-coolvetica text-[#ffffff] hover:text-blue-400 transition"
          >
            Create Account
          </a>
          <a
            href="/browse"
            className="text-sm/6 font-semibold font-coolvetica text-[#ffffff] hover:text-blue-400 transition"
          >
            Browse
          </a>
          <a
            href="/login"
            className="text-sm/6 font-semibold font-coolvetica text-[#ffffff] hover:text-blue-400 transition"
          >
            FAQ
          </a>
          <a
            href="/aboutus"
            className="text-sm/6 font-semibold font-coolvetica text-[#ffffff] hover:text-blue-400 transition"
          >
            About Us
          </a>
        </PopoverGroup>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a
            href="/login"
            className="text-sm/6 font-semibold font-coolvetica text-[#ffffff] hover:text-blue-400 transition"
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
              <span className="text-white text-xl font-bold font-coolvetica">
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
                  href="/login"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-[#ffffff] hover:bg-[#2E2E2E] transition"
                >
                  Sign In
                </a>
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