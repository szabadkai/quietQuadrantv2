import React, { forwardRef } from "react";

export const Button = forwardRef(function Button(
  { children, primary, focused, disabled, onClick, style, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`qq-btn ${primary ? "qq-btn-primary" : ""} ${focused ? "qq-btn-focused" : ""}`}
      disabled={disabled}
      onClick={onClick}
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
