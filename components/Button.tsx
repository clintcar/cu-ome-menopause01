import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  return (
    <button
      className={`bg-[#CFB87C] text-black text-sm px-6 py-2 rounded-lg disabled:opacity-50 h-fit hover:bg-[#B8A569] transition-colors duration-200 ${className}`}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
};
