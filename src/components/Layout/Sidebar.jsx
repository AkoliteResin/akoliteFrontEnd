// src/components/Layout/Sidebar.jsx
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const links = [
    { label: "Dashboard", to: "/" },
    { label: "Raw Materials", to: "/raw-materials" },
    { label: "Possible Raw Materials", to: "/possible-raw-materials" },
    { label: "Product Formulas", to: "/formulas" },
    { label: "Production Requests", to: "/production-requests" },
  ];

  return (
    <nav className="d-flex flex-column p-3 bg-light vh-100" style={{ minWidth: 220 }}>
        <div className="d-flex align-items-center gap-2 mb-3">
  <div
    style={{
      width: 36,
      height: 36,
      background: "#0d6efd",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 800,
      fontSize: "1.2rem",
    }}
  >
    A
  </div>

  <div
    style={{
      fontWeight: 800,
      fontSize: "1.3rem",
      letterSpacing: "1px",
    }}
  >
    AKOLITE
  </div>
</div>

<small className="text-muted mb-3">Resin Manufacturing Dashboard</small>



      <ul className="nav nav-pills flex-column">
        {links.map((l) => (
          <li className="nav-item mb-1" key={l.to}>
            <NavLink
              to={l.to}
              className={({ isActive }) =>
                "nav-link" + (isActive ? " active" : " text-dark")
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
