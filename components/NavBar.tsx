"use client";

import React from "react";

export default function NavBar() {
  return (
    <>
      <div className="flex flex-row justify-between items-center w-[1000px] m-auto p-6 relative">
        <div className="flex-1"></div>
        <div className="flex flex-col gap-1 items-center relative w-full">
          <p className="text-3xl font-semibold text-black">
            Menopause Education 01 - Elena Morales
          </p>
          <div className="absolute right-0 top-full mt-1">
            <a
              href="https://www.linkedin.com/in/clintcarlson/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-black hover:underline"
            >
              Author: Clint Carlson | Contact
            </a>
          </div>
        </div>
        <div className="flex-1"></div>
        {/* Right-side links are intentionally hidden */}
      </div>
    </>
  );
}
