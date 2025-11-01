// src/pages/RawMaterialHistory.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getRawMaterialHistory } from "../api/rawMaterialHistory";
import { paginate } from "../utils/paginate";
import { toast } from "react-toastify";

const HISTORY_ACTION_TYPES = {
  NEW_STOCK: "NEW_STOCK",
  USED_FOR_PRODUCTION: "USED_FOR_PRODUCTION",
  PRODUCTION_CANCELLATION: "PRODUCTION_CANCELLATION",
  RESTOCKED_AFTER_CANCEL: "RESTOCKED_AFTER_CANCEL",
};

export default function RawMaterialHistory() {
  const location = useLocation();
  const cameFromRawMaterials = location.state?.fromRawMaterials ?? false;

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const [actionType, setActionType] = useState(
    cameFromRawMaterials ? HISTORY_ACTION_TYPES.NEW_STOCK : ""
  );

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [page, actionType]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
      };

      if (actionType) params.actionType = actionType;

      const res = await getRawMaterialHistory(params);

      setHistory(res.data.data);
      setTotal(res.data.total);
      setTotalPages(Math.ceil(res.data.total / limit));
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  return (
    <div>
      <h3 className="mb-3">Raw Material History</h3>
      <p className="text-muted">
        View detailed stock movements and usage history.
      </p>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Action Type</label>
              <select
                className="form-select"
                value={actionType}
                onChange={(e) => {
                  setActionType(e.target.value);
                  setPage(1);
                }}
              >
                {!cameFromRawMaterials && <option value="">All</option>}
                {Object.values(HISTORY_ACTION_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center">
              <div className="spinner-border" role="status" />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Action Type</th>
                    <th className="text-end">Quantity</th>
                    <th>Direction</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No history records found
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>
                          <span className="badge bg-secondary">{item.actionType}</span>
                        </td>
                        <td
                          className="text-end fw-bold"
                          style={{
                            color:
                              item.changeDirection === "INCREASE"
                                ? "green"
                                : "red",
                          }}
                        >
                          {item.quantity}
                        </td>
                        <td>
                          {item.changeDirection === "INCREASE" ? (
                            <span className="badge bg-success">Increase</span>
                          ) : (
                            <span className="badge bg-danger">Decrease</span>
                          )}
                        </td>
                        <td>{formatDate(item.createdDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="card-footer d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted">
              Showing {history.length} of {total} records
            </small>
          </div>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <li
                    key={p}
                    className={`page-item ${p === page ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => setPage(p)}>
                      {p}
                    </button>
                  </li>
                )
              )}

              <li
                className={`page-item ${
                  page >= totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
