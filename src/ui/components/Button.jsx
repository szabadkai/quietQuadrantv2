import React, { forwardRef } from "react";
import { soundManager } from "../../audio/SoundManager.js";

export const Button = forwardRef(function Button(
  { children, primary, focused, disabled, onClick, style, ...props },
  ref
) {
  const handleMouseEnter = () => {
    if (!disabled) {
      soundManager.play("menuHover");
    }
  };

  const handleClick = (e) => {
    if (!disabled) {
      soundManager.play("menuSelect");
      onClick?.(e);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={`qq-btn ${primary ? "qq-btn-primary" : ""} ${focused ? "qq-btn-focused" : ""}`}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
});
