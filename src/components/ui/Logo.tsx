
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  whiteShield?: boolean;
}

export const Logo = ({ size = "md", showText = true, whiteShield = false }: LogoProps) => {
  // Size mappings
  const sizes = {
    sm: { svg: 24, text: "text-base" },
    md: { svg: 32, text: "text-xl" },
    lg: { svg: 48, text: "text-2xl" },
  };

  return (
    <div className="flex items-center gap-2">
      <svg
        width={sizes[size].svg}
        height={sizes[size].svg}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={whiteShield ? "text-white" : "text-getclinicas-primary"}
      >
        <path
          d="M12 2L4 6V12C4 17.55 7.84 22.74 12 24C16.16 22.74 20 17.55 20 12V6L12 2Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M12 2L4 6V12C4 17.55 7.84 22.74 12 24C16.16 22.74 20 17.55 20 12V6L12 2ZM18 12C18 16.5 14.87 20.74 12 21.82C9.13 20.74 6 16.5 6 12V7.4L12 4.66L18 7.4V12Z"
          fill="currentColor"
        />
        <text
          x="12"
          y="14"
          fontSize="9"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          G
        </text>
      </svg>
      {showText && <span className={`font-bold ${sizes[size].text}`}>GetClinicas</span>}
    </div>
  );
};

export default Logo;
