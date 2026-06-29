import React from "react";
import "./Header.css";

interface HeaderProps {
  title: string | undefined;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  if (!title) return null;

  return (
    <div className="header-bar">
      <h2 style={{ margin: 0, fontWeight: 600 }}>{title}</h2>
    </div>
  );
};
