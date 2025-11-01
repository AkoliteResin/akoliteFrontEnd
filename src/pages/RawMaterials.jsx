// src/pages/RawMaterials.jsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useDebounce from "../utils/useDebounce";
import { paginate } from "../utils/paginate";
import {
  getRawMaterials,
  addRawMaterialStock,
} from "../api/rawMaterials";
import { useNavigate } from "react-router-dom";
import {
  getPossibleRawMaterials,
  createPossibleRawMaterial,
} from "../api/possibleRawMaterials";

export default function RawMaterials() {
  // data
  const [stockList, setStockList] = useState([]);
  const [possibleList, setPossibleList] = useState([]);

  // ui state
  const [loading, setLoading] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);

  // form state - add stock
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const navigate = useNavigate();

  // form state - new material
  const [newMaterialName, setNewMaterialName] = useState("");

  // table controls: search, filter, sort, pagination
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [filterMaterial, setFilterMaterial] = useState(""); // name from possibleList
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");

  // sort: key and direction
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc"); // 'asc' or 'desc'

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // load data
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [stockRes, possibleRes] = await Promise.all([
        getRawMaterials(),
        getPossibleRawMaterials(),
      ]);
      setStockList(stockRes.data || []);
      setPossibleList(possibleRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Add stock
  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      // check selection by matching name -> id
      const selected = possibleList.find((p) => p.name === selectedMaterial);
      if (!selected) {
        toast.error("Please select a valid raw material from suggestions");
        return;
      }
      if (!quantity || Number(quantity) <= 0) {
        toast.error("Enter a valid quantity");
        return;
      }
      setLoading(true);
      await addRawMaterialStock({
        rawMaterialId: selected.id,
        quantity: parseFloat(quantity),
      });
      toast.success("Stock added successfully");
      // reset form
      setSelectedMaterial("");
      setQuantity("");
      setShowAddStock(false);
      // reload
      await loadAll();
      setPage(1);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to add stock");
    } finally {
      setLoading(false);
    }
  };

  // Create new possible raw material
  const handleCreateNewMaterial = async (e) => {
    e.preventDefault();
    try {
      if (!newMaterialName.trim()) {
        toast.error("Enter a name");
        return;
      }
      setLoading(true);
      await createPossibleRawMaterial({ name: newMaterialName.trim() });
      toast.success("New raw material type added");
      setNewMaterialName("");
      setShowNewMaterialModal(false);
      // refresh lists
      await loadAll();
    } catch (err) {
      console.error(err);
      const msg =
      err?.response?.data?.message || "Unknown error occurred";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Filtering / searching / sorting logic (client-side)
  const processedList = useMemo(() => {
    let items = [...stockList];

    // search by name
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }

    // filter by exact material (if chosen)
    if (filterMaterial) {
      items = items.filter((i) => i.name === filterMaterial);
    }

    // filter by min / max quantity
    if (minQty !== "") {
      const v = parseFloat(minQty);
      if (!Number.isNaN(v)) items = items.filter((i) => i.totalQuantity >= v);
    }
    if (maxQty !== "") {
      const v = parseFloat(maxQty);
      if (!Number.isNaN(v)) items = items.filter((i) => i.totalQuantity <= v);
    }

    // sort
    items.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];

      if (sortKey === "name") {
        va = (va || "").toLowerCase();
        vb = (vb || "").toLowerCase();
      } else {
        va = Number(va) || 0;
        vb = Number(vb) || 0;
      }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [stockList, debouncedSearch, filterMaterial, minQty, maxQty, sortKey, sortDir]);

  // pagination slice
  const { data: pageData, pageSize: ps, page: currentPage, total, totalPages } = useMemo(() => {
    return paginate(processedList, page, pageSize);
  }, [processedList, page, pageSize]);

  // utils
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterMaterial("");
    setMinQty("");
    setMaxQty("");
    setPage(1);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3 className="mb-1">Raw Materials Stock</h3>
          <small className="text-muted">View, search, filter, sort and add new stock</small>
        </div>

        <div>
          {/* ✅ ADD THIS BUTTON */}
          <button
            className="btn btn-outline-info me-2"
            onClick={() =>
              navigate("/raw-materials/history", {
                state: { fromRawMaterials: true }
              })
            }
          >
            View History
          </button>

          <button className="btn btn-outline-primary me-2" onClick={() => setShowAddStock((s) => !s)}>
            {showAddStock ? "Hide Add Stock" : "Add New Stock"}
          </button>

          <button className="btn btn-secondary" onClick={() => setShowNewMaterialModal(true)}>
            Add New Raw Material Type
          </button>
        </div>
      </div>


      {/* Controls: Search, Filter, Page size */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label small">Search by name</label>
              <input
                type="search"
                className="form-control"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small">Filter by material</label>
              <select
                className="form-select"
                value={filterMaterial}
                onChange={(e) => {
                  setFilterMaterial(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All materials</option>
                {possibleList.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label small">Min qty</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={minQty}
                onChange={(e) => {
                  setMinQty(e.target.value);
                  setPage(1);
                }}
                placeholder="min"
              />
            </div>

            <div className="col-md-2">
              <label className="form-label small">Max qty</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={maxQty}
                onChange={(e) => {
                  setMaxQty(e.target.value);
                  setPage(1);
                }}
                placeholder="max"
              />
            </div>

            <div className="col-md-1 d-grid">
              <button className="btn btn-light border" onClick={clearFilters} title="Clear filters">
                Clear
              </button>
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
                    <th
                      role="button"
                      onClick={() => handleSort("name")}
                      className="align-middle"
                      style={{ width: "60%" }}
                    >
                      Name{" "}
                      {sortKey === "name" && <small>({sortDir === "asc" ? "▲" : "▼"})</small>}
                    </th>
                    <th
                      role="button"
                      onClick={() => handleSort("totalQuantity")}
                      className="align-middle text-end"
                      style={{ width: "40%" }}
                    >
                      Quantity{" "}
                      {sortKey === "totalQuantity" && (
                        <small>({sortDir === "asc" ? "▲" : "▼"})</small>
                      )}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-4 text-muted">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    pageData.map((item) => (
                      <tr key={item.id}>
                        <td className="align-middle">{item.name}</td>
                        <td className="align-middle text-end">{item.totalQuantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer: pagination & page size */}
        <div className="card-footer d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted">
              Showing {pageData.length} of {total} items
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div>
              <label className="form-label small mb-0">Per page</label>
              <select
                className="form-select form-select-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Prev
                  </button>
                </li>

                {/* show up to 5 page buttons centered around current page */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, page - 3),
                    Math.min(totalPages, page + 2)
                  )
                  .map((pNum) => (
                    <li key={pNum} className={`page-item ${pNum === page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPage(pNum)}>
                        {pNum}
                      </button>
                    </li>
                  ))}

                <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Add Stock form (collapsible card) */}
      {showAddStock && (
        <div className="card mt-3">
          <div className="card-body">
            <h5>Add Stock</h5>
            <form onSubmit={handleAddStock}>
              <div className="row g-2 align-items-end">
                <div className="col-md-6">
                  <label className="form-label">Raw Material</label>
                  <input
                    list="raw-materials-list"
                    className="form-control"
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    placeholder="Start typing to auto-suggest"
                    required
                  />
                  <datalist id="raw-materials-list">
                    {possibleList.map((p) => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-3 d-grid">
                  <button className="btn btn-success">Add Stock</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Material Modal */}
      {showNewMaterialModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "#00000055" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Raw Material Type</h5>
                <button className="btn-close" onClick={() => setShowNewMaterialModal(false)} />
              </div>
              <form onSubmit={handleCreateNewMaterial}>
                <div className="modal-body">
                  <label className="form-label">Material Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" type="submit">Add</button>
                  <button className="btn btn-secondary" type="button" onClick={() => setShowNewMaterialModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
