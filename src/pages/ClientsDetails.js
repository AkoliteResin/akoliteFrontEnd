import React, { useState, useEffect } from "react";
import axiosInstance, { API_ENDPOINTS } from "../utils/axiosInstance";
import "./ClientsDetails.css";

// Indian States and Districts Data
const statesAndDistricts = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela Pendra Marwahi", "Janjgir Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Kolasib", "Khawzawl", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Noklak", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Debagarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Mohali", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Medchal Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
  "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"]
};

function ClientsDetails() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [clientQuery, setClientQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyData, setHistoryData] = useState({ productions: [], orders: [] });
  const [historyView, setHistoryView] = useState('productions'); // 'productions' | 'orders'
  // Filters for Production history
  const [orderIdQuery, setOrderIdQuery] = useState("");
  const [suffixFilter, setSuffixFilter] = useState("all"); // all | S1 | S2 | none
  // Date filter for both Production and Orders history; default to today
  const computeToday = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const [selectedDate, setSelectedDate] = useState(() => computeToday());

  const getLocalYMD = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    if (isNaN(d)) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  
  // Form state for adding/editing client
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    company: "",
    gst: "",
    notes: "",
    district: "",
    state: ""
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.CLIENTS.GET_ALL);
      setClients(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      state: selectedState,
      district: "" // Reset district when state changes
    }));
  };

  const getDistrictsForState = () => {
    if (!formData.state) return [];
    return statesAndDistricts[formData.state] || [];
  };

  const filteredClients = clients.filter((c) => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  const loadClientHistory = async (client) => {
    if (!client?.name) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const [pr, fo] = await Promise.all([
        axiosInstance.get("/api/produced-resins"),
        axiosInstance.get("/api/future-orders"),
      ]);

      const name = (client.name || "").toLowerCase();
      const allProduced = pr.data?.items || [];
      // Production history for this client across statuses (exclude deleted)
      // For deployed items, only show the actual dispatch records (with originalProductionId), not the original production record
      const productions = allProduced
        .filter((i) => {
          if ((i.clientName || "").toLowerCase() !== name) return false;
          if ((i.status || 'pending') === 'deleted') return false;
          // If deployed, only show records with originalProductionId (the actual dispatch records)
          if (i.status === 'deployed' && !i.originalProductionId) return false;
          return true;
        })
        .sort((a, b) => new Date(b.producedAt || 0) - new Date(a.producedAt || 0));

      const allOrders = Array.isArray(fo.data) ? fo.data : [];
      const orders = allOrders
        .filter((o) => (o.clientName || "").toLowerCase() === name)
        .sort((a, b) => new Date(b.createdAt || b.orderTime || 0) - new Date(a.createdAt || a.orderTime || 0));

      setHistoryData({ productions, orders });
    } catch (err) {
      console.error("Failed to load client history", err);
      setHistoryError(err.response?.data?.message || "Failed to load client history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    loadClientHistory(client);
    // reset filters when switching client
    setOrderIdQuery("");
    setSuffixFilter("all");
    setSelectedDate(computeToday());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert("Name and Phone are required!");
      return;
    }

    if (!formData.district || !formData.state) {
      alert("District and State are required!");
      return;
    }

    try {
      if (editingClient) {
        // Update existing client
        const response = await axiosInstance.put(API_ENDPOINTS.CLIENTS.UPDATE.replace(':id', editingClient._id), formData);
        alert("Client updated successfully!");
        
        // Update selectedClient if it was the one being edited
        if (selectedClient && selectedClient._id === editingClient._id) {
          setSelectedClient(response.data);
        }
      } else {
        // Add new client
        await axiosInstance.post(API_ENDPOINTS.CLIENTS.CREATE, formData);
        alert("Client added successfully!");
      }
      
      resetForm();
      fetchClients();
    } catch (err) {
      console.error("Error saving client:", err);
      alert(err.response?.data?.message || "Failed to save client");
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      phone: client.phone || "",
      address: client.address || "",
      email: client.email || "",
      company: client.company || "",
      gst: client.gst || "",
      notes: client.notes || "",
      district: client.district || "",
      state: client.state || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    const pass = window.prompt("Enter admin password to confirm deletion:");
    if (pass == null) return; // cancelled
    if (pass !== '123@Ako') {
      alert('Incorrect password. Deletion cancelled.');
      return;
    }

    try {
      await axiosInstance.delete(API_ENDPOINTS.CLIENTS.DELETE.replace(':id', id), {
        headers: { 'x-admin-pass': pass }
      });
      alert("Client deleted successfully!");
      fetchClients();
    } catch (err) {
      console.error("Error deleting client:", err);
      alert(err.response?.data?.message || "Failed to delete client");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      email: "",
      company: "",
      gst: "",
      notes: ""
    });
    setEditingClient(null);
  };

  return (
    <div className="sellers-container">
      <h1>👥 Clients Management</h1>

      {/* Add/Edit Form */}
      <div className="client-form-card">
        <h2>{editingClient ? "✏️ Edit Client" : "➕ Add New Client"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Client/Company Name"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Company Name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                name="gst"
                value={formData.gst}
                onChange={handleInputChange}
                placeholder="GST Number"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Full Address"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleStateChange}
                required
              >
                <option value="">-- Select State --</option>
                {Object.keys(statesAndDistricts).sort().map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>District *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                required
                disabled={!formData.state}
              >
                <option value="">
                  {formData.state ? "-- Select District --" : "-- Select State First --"}
                </option>
                {getDistrictsForState().map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes or comments..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingClient ? "Update Client" : "Add Client"}
            </button>
            {editingClient && (
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Clients List + Detail/Orders Layout */}
      <div className="clients-list-section">
        <div className="clients-toolbar">
          <h2>📋 All Clients ({clients.length})</h2>
          <div className="client-search-wrap">
            <input
              type="text"
              className="client-search"
              placeholder="Search by name, phone, company, email"
              value={clientQuery}
              onChange={(e) => {
                setClientQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)}
            />
            {showSearchDropdown && (
              <div className="client-search-dropdown">
                {filteredClients.length === 0 ? (
                  <div className="dropdown-empty">No clients found</div>
                ) : (
                  filteredClients.slice(0, 8).map(c => (
                    <button
                      type="button"
                      key={c._id}
                      className="dropdown-item"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setClientQuery(`${c.name} (${c.phone || '-'})`);
                        handleSelectClient(c);
                        setShowSearchDropdown(false);
                      }}
                    >
                      <strong>{c.name}</strong>
                      <span className="dropdown-meta">{c.phone || '-'}{c.company ? ` • ${c.company}` : ''}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {loading && <div className="loading">Loading clients...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && clients.length === 0 && (
          <div className="empty-state">No clients added yet. Add your first client above!</div>
        )}

        {!loading && !error && clients.length > 0 && (
          <div className="clients-layout">
            <div className="client-list-pane">
              <div className="client-list" role="listbox">
                {filteredClients.map((client) => (
                  <div
                    key={client._id}
                    role="option"
                    className={`client-list-item ${selectedClient?._id === client._id ? 'active' : ''}`}
                    onClick={() => handleSelectClient(client)}
                    title={client.name}
                  >
                    <span className="client-name">{client.name}</span>
                    <span className="client-list-actions">
                      <button
                        className="btn-icon"
                        onClick={(e) => { e.stopPropagation(); handleEdit(client); }}
                        title="Edit"
                      >✏️</button>
                      <button
                        className="btn-icon"
                        onClick={(e) => { e.stopPropagation(); handleDelete(client._id, client.name); }}
                        title="Delete"
                      >🗑️</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="client-detail-pane">
              {!selectedClient ? (
                <div className="empty-state">Select a client to view details and orders.</div>
              ) : (
                <>
                  <div className="client-detail-card">
                    <div className="detail-header">
                      <h3>{selectedClient.name}</h3>
                      <div className="client-actions">
                        <button className="btn-edit" onClick={() => handleEdit(selectedClient)} title="Edit">✏️</button>
                        <button className="btn-delete" onClick={() => handleDelete(selectedClient._id, selectedClient.name)} title="Delete">🗑️</button>
                      </div>
                    </div>
                    <div className="client-details">
                      <div className="detail-row"><span className="detail-label">📞 Phone:</span><span className="detail-value">{selectedClient.phone || '-'}</span></div>
                      {selectedClient.email && <div className="detail-row"><span className="detail-label">✉️ Email:</span><span className="detail-value">{selectedClient.email}</span></div>}
                      {selectedClient.company && <div className="detail-row"><span className="detail-label">🏢 Company:</span><span className="detail-value">{selectedClient.company}</span></div>}
                      {selectedClient.gst && <div className="detail-row"><span className="detail-label">🔢 GST:</span><span className="detail-value">{selectedClient.gst}</span></div>}
                      {selectedClient.address && <div className="detail-row"><span className="detail-label">📍 Address:</span><span className="detail-value">{selectedClient.address}</span></div>}
                      {selectedClient.district && <div className="detail-row"><span className="detail-label">🏙️ District:</span><span className="detail-value">{selectedClient.district}</span></div>}
                      {selectedClient.state && <div className="detail-row"><span className="detail-label">🗺️ State:</span><span className="detail-value">{selectedClient.state}</span></div>}
                      {selectedClient.notes && <div className="detail-row notes"><span className="detail-label">📝 Notes:</span><span className="detail-value">{selectedClient.notes}</span></div>}
                      {selectedClient.createdAt && <div className="detail-row timestamp"><span className="detail-label">Added:</span><span className="detail-value">{new Date(selectedClient.createdAt).toLocaleDateString()}</span></div>}
                    </div>
                  </div>

                  {/* Combined History Section */}
                  <div className="client-history-section">
                    <h3>🧾 Order History — {selectedClient.name}</h3>
                    <div className="history-tabs">
                      <button
                        className={historyView === 'productions' ? 'tab active' : 'tab'}
                        onClick={() => setHistoryView('productions')}
                      >
                        Production
                      </button>
                      <button
                        className={historyView === 'orders' ? 'tab active' : 'tab'}
                        onClick={() => setHistoryView('orders')}
                      >
                        Orders
                      </button>
                    </div>
                    {historyLoading && <div className="loading">Loading history…</div>}
                    {historyError && <div className="error">{historyError}</div>}

                    {!historyLoading && !historyError && (
                      <div className="history-grid">
                        {historyView === 'productions' && (
                          <div className="history-card">
                            <h4>Production</h4>
                            {/* Filters: Order ID search + suffix chips */}
                            <div className="filters-row">
                              <input
                                type="date"
                                className="date-input"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                title="Filter by date"
                              />
                              <input
                                type="text"
                                className="orderid-search"
                                placeholder="Search Order ID…"
                                value={orderIdQuery}
                                onChange={(e) => setOrderIdQuery(e.target.value)}
                              />
                              <div className="suffix-filters">
                                <button
                                  type="button"
                                  className={`chip ${suffixFilter === 'all' ? 'active' : ''}`}
                                  onClick={() => setSuffixFilter('all')}
                                >
                                  All
                                </button>
                                <button
                                  type="button"
                                  className={`chip ${suffixFilter === 'S1' ? 'active' : ''}`}
                                  onClick={() => setSuffixFilter('S1')}
                                >
                                  S1
                                </button>
                                <button
                                  type="button"
                                  className={`chip ${suffixFilter === 'S2' ? 'active' : ''}`}
                                  onClick={() => setSuffixFilter('S2')}
                                >
                                  S2
                                </button>
                                <button
                                  type="button"
                                  className={`chip ${suffixFilter === 'none' ? 'active' : ''}`}
                                  onClick={() => setSuffixFilter('none')}
                                >
                                  No suffix
                                </button>
                              </div>
                            </div>
                            {historyData.productions.filter(p => {
                              const lastTime = p.deployedAt || p.completedAt || p.proceededAt || p.producedAt;
                              const ymd = getLocalYMD(lastTime);
                              return selectedDate ? ymd === selectedDate : true;
                            }).length === 0 ? (
                              <div className="empty-state">No production found for selected date.</div>
                            ) : (
                              <table className="history-table">
                                <thead>
                                  <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Resin</th>
                                    <th>Qty</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {historyData.productions
                                    // Date filter first
                                    .filter((p) => {
                                      const lastTime = p.deployedAt || p.completedAt || p.proceededAt || p.producedAt;
                                      const ymd = getLocalYMD(lastTime);
                                      return selectedDate ? ymd === selectedDate : true;
                                    })
                                    .filter((p) => {
                                      const q = orderIdQuery.trim().toLowerCase();
                                      const ord = (p.orderNumber || "").toString().toLowerCase();
                                      const matchQuery = q ? ord.includes(q) : true;
                                      if (suffixFilter === 'all') return matchQuery;
                                      const upper = (p.orderNumber || "").toString().toUpperCase();
                                      const endsS1 = upper.endsWith('S1');
                                      const endsS2 = upper.endsWith('S2');
                                      const hasNoSuffix = !endsS1 && !endsS2 && upper.length > 0;
                                      if (suffixFilter === 'S1') return matchQuery && endsS1;
                                      if (suffixFilter === 'S2') return matchQuery && endsS2;
                                      if (suffixFilter === 'none') return matchQuery && hasNoSuffix;
                                      return matchQuery;
                                    })
                                    .map((p) => {
                                      const lastTime = p.deployedAt || p.completedAt || p.proceededAt || p.producedAt;
                                      const st = (p.status || 'pending');
                                      const label = st === 'deployed' ? 'dispatched' : (st === 'in_process' ? 'in progress' : st);
                                      return (
                                        <tr key={p._id}>
                                          <td>{p.orderNumber ? `#${p.orderNumber}` : '-'}</td>
                                          <td>{lastTime ? new Date(lastTime).toLocaleString() : '-'}</td>
                                          <td>{p.resinType}</td>
                                          <td>{p.litres} {p.unit || 'litres'}</td>
                                          <td>
                                            <span className={`status-chip ${st}`}>
                                              {label}
                                            </span>
                                          </td>
                                        </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}

                        {historyView === 'orders' && (
                          <div className="history-card">
                            <h4>Orders</h4>
                            {/* Date filter for orders */}
                            <div className="filters-row">
                              <input
                                type="date"
                                className="date-input"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                title="Filter by date"
                              />
                            </div>
                            {historyData.orders.filter(o => {
                              const t = o.createdAt || o.orderTime || o.scheduledDate;
                              const ymd = getLocalYMD(t);
                              return selectedDate ? ymd === selectedDate : true;
                            }).length === 0 ? (
                              <div className="empty-state">No orders found for selected date.</div>
                            ) : (
                              <table className="history-table">
                                <thead>
                                  <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Resin</th>
                                    <th>Qty</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {historyData.orders
                                    .filter((o) => {
                                      const t = o.createdAt || o.orderTime || o.scheduledDate;
                                      const ymd = getLocalYMD(t);
                                      return selectedDate ? ymd === selectedDate : true;
                                    })
                                    .map((o) => (
                                      <tr key={o._id}>
                                        <td>{o.orderNumber ? `#${o.orderNumber}` : '-'}</td>
                                        <td>{new Date(o.createdAt || o.orderTime || o.scheduledDate).toLocaleString()}</td>
                                        <td>{o.resinType}</td>
                                        <td>{o.litres} {o.unit || 'litres'}</td>
                                        <td>{(o.status || 'pending').toUpperCase()}</td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientsDetails;
