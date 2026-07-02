import React from "react";
import "./Input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => {
  return (
    <div className="ui-input-group">
      {label && <label className="ui-input-label">{label}</label>}
      <input className={`ui-input ${className}`} {...props} />
    </div>
  );
};
