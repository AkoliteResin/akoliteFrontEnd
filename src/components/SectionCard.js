import React from "react";
import { useNavigate } from "react-router-dom";
import "./SectionCard.css";


function SectionCard({ title, description, link }) {
  const navigate = useNavigate();


  const handleClick = () => {
    if (link) navigate(link);
    else alert(`${title} section coming soon!`);
  };


  return (
    <div className="section-card">
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={handleClick}>Open</button>
    </div>
  );
}


export default SectionCard;