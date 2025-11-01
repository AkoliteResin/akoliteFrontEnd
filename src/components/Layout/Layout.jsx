// src/components/Layout/Layout.jsx
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="d-flex">
      <Sidebar />
      <main className="flex-grow-1">
        <div className="container-fluid p-4">{children}</div>
      </main>
    </div>
  );
}
