import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";
import { Box, Tabs, Tab } from "@mui/material";
import SellerComparison from "./SellerComparison";
import PriceManagementModal from "./PriceManagementModal";
import "./Sellers.css";

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

function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingSeller, setEditingSeller] = useState(null);
  const [sellerQuery, setSellerQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedSellerForPricing, setSelectedSellerForPricing] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    company: "",
    gst: "",
    notes: "",
    district: "",
    state: "",
    rawMaterialsSupplied: [],
  });

  useEffect(() => {
    fetchSellers();
    fetchRawMaterials();
  }, []);

  const fetchRawMaterials = async () => {
    try {
      const response = await axiosInstance.get("/api/raw-materials");
      setRawMaterials(response.data || []);
    } catch (err) {
      console.error("Error fetching raw materials:", err);
    }
  };

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/sellers");
      setSellers(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching sellers:", err);
      setError("Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMaterialToggle = (material) => {
    setFormData((prev) => ({
      ...prev,
      rawMaterialsSupplied: prev.rawMaterialsSupplied.includes(material)
        ? prev.rawMaterialsSupplied.filter((m) => m !== material)
        : [...prev.rawMaterialsSupplied, material],
    }));
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state,
      district: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      setError("Name and phone are required");
      return;
    }

    if (!formData.rawMaterialsSupplied || formData.rawMaterialsSupplied.length === 0) {
      setError("Please select at least one raw material supplied");
      return;
    }

    try {
      if (editingSeller) {
        await axiosInstance.put(
          `/api/sellers/${editingSeller._id}`,
          formData
        );
        setEditingSeller(null);
      } else {
        await axiosInstance.post("/api/sellers", formData);
      }
      fetchSellers();
      resetForm();
      setError(null);
    } catch (err) {
      console.error("Error saving seller:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to save seller";
      setError(errorMessage);
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
      notes: "",
      district: "",
      state: "",
      rawMaterialsSupplied: [],
    });
  };

  const handleEdit = (seller) => {
    setEditingSeller(seller);
    setFormData({
      name: seller.name,
      phone: seller.phone,
      address: seller.address || "",
      email: seller.email || "",
      company: seller.company || "",
      gst: seller.gst || "",
      notes: seller.notes || "",
      district: seller.district || "",
      state: seller.state || "",
      rawMaterialsSupplied: seller.rawMaterialsSupplied || [],
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this seller?")) {
      try {
        await axiosInstance.delete(`/api/sellers/${id}`);
        fetchSellers();
        if (selectedSeller?._id === id) {
          setSelectedSeller(null);
        }
      } catch (err) {
        console.error("Error deleting seller:", err);
        setError("Failed to delete seller");
      }
    }
  };

  const handleCancel = () => {
    setEditingSeller(null);
    resetForm();
  };

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(sellerQuery.toLowerCase()) ||
      seller.phone.includes(sellerQuery) ||
      seller.company?.toLowerCase().includes(sellerQuery.toLowerCase()) ||
      seller.rawMaterialsSupplied?.some((material) =>
        material.toLowerCase().includes(sellerQuery.toLowerCase())
      )
  );

  return (
    <div className="sellers-container">
      <h1>🏭 Procurement</h1>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#3b82f6' },
            '& .MuiTab-root': { textTransform: 'none', fontSize: '1rem', fontWeight: 600 }
          }}
        >
          <Tab label="📋 Manage Sellers" />
          <Tab label="💰 Price Comparison" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <div>
          {/* Add/Edit Form */}
          <div className="seller-form-card">
            <h2>
              {editingSeller ? "✏️ Edit Seller" : "➕ Add New Seller"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter seller name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="form-group">
                  <label>GST Number</label>
                  <input
                    type="text"
                    name="gst"
                    value={formData.gst}
                    onChange={handleInputChange}
                    placeholder="Enter GST number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <select name="state" value={formData.state} onChange={handleStateChange}>
                    <option value="">Select State</option>
                    {Object.keys(statesAndDistricts).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    disabled={!formData.state}
                  >
                    <option value="">Select District</option>
                    {formData.state &&
                      statesAndDistricts[formData.state]?.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  rows="2"
                />
              </div>

              <div className="form-group full-width">
                <label>Raw Materials Supplied</label>
                <div className="checkbox-group">
                  {rawMaterials.map((material) => (
                    <label key={material.name} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.rawMaterialsSupplied.includes(material.name)}
                        onChange={() => handleMaterialToggle(material.name)}
                      />
                      {material.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Enter any additional notes"
                  rows="2"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingSeller ? "Update Seller" : "Add Seller"}
                </button>
                {editingSeller && (
                  <button type="button" className="btn-cancel" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by seller name, phone, company, or raw materials..."
              value={sellerQuery}
              onChange={(e) => setSellerQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
            />
          </div>

          {/* Sellers List */}
          <div className="sellers-list">
            {loading ? (
              <p>Loading sellers...</p>
            ) : filteredSellers.length === 0 ? (
              <p>No sellers found</p>
            ) : (
              <div className="sellers-grid">
                {filteredSellers.map((seller) => (
                  <div key={seller._id} className="seller-card">
                    <div className="seller-header">
                      <h3>{seller.name}</h3>
                      <div className="seller-actions">
                        <button
                          className="btn-edit"
                          onClick={() => {
                            handleEdit(seller);
                            setSelectedSeller(seller);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => {
                            setSelectedSellerForPricing(seller);
                            setPriceModalOpen(true);
                          }}
                          style={{ backgroundColor: '#10b981' }}
                          title="Manage Prices"
                        >
                          💰
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(seller._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="seller-info">
                      <p>
                        <strong>📞 Phone:</strong> {seller.phone}
                      </p>
                      {seller.email && (
                        <p>
                          <strong>📧 Email:</strong> {seller.email}
                        </p>
                      )}
                      {seller.company && (
                        <p>
                          <strong>🏢 Company:</strong> {seller.company}
                        </p>
                      )}
                      {seller.gst && (
                        <p>
                          <strong>🔢 GST:</strong> {seller.gst}
                        </p>
                      )}
                      {seller.state || seller.district ? (
                        <p>
                          <strong>📍 Location:</strong> {seller.district}
                          {seller.district && seller.state ? ", " : ""}
                          {seller.state}
                        </p>
                      ) : null}
                      {seller.address && (
                        <p>
                          <strong>🏠 Address:</strong> {seller.address}
                        </p>
                      )}
                      {seller.rawMaterialsSupplied?.length > 0 && (
                        <p>
                          <strong>📦 Supplies:</strong>{" "}
                          {seller.rawMaterialsSupplied.join(", ")}
                        </p>
                      )}
                      {seller.notes && (
                        <p>
                          <strong>📝 Notes:</strong> {seller.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <SellerComparison />
      )}

      {/* Price Management Modal */}
      <PriceManagementModal
        open={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        seller={selectedSellerForPricing}
        rawMaterials={rawMaterials}
        onSave={() => {
          fetchSellers();
        }}
      />
    </div>
  );
}

export default Sellers;
