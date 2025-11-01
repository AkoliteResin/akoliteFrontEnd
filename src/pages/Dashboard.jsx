import { Link } from "react-router-dom";

export default function Dashboard() {
  const cards = [
    { title: "Possible Raw Materials", link: "/possible-raw-materials" },
    { title: "Raw Materials", link: "/raw-materials" },
    { title: "Product Formulas", link: "/formulas" },
    { title: "Production Requests", link: "/production-requests" },
  ];

  return (
    <div className="container py-5">
      {/* Title */}
      <h1 className="text-primary fw-bold mb-3">AKOLITE</h1>

      {/* Short description */}
      <p className="text-muted mb-5">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sem at 
        nunc placerat condimentum nec non lorem.
      </p>

      {/* Cards section */}
      <div className="row">
        {cards.map((card) => (
          <div key={card.title} className="col-md-3 mb-4">
            <Link
              to={card.link}
              className="text-decoration-none"
            >
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-center text-center">
                  <h5 className="card-title text-dark fw-bold">{card.title}</h5>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
