import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateFacultyJSONFromSheet } from "./googleSheets.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Paths
const registryPath = path.join(__dirname, "data", "facultyRegistry.json");
const facultyDataDir = path.join(__dirname, "data", "faculty");
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || "iitdh_faculty_secret_2024";

// Ensure faculty directory exists
if (!fs.existsSync(facultyDataDir)) {
  fs.mkdirSync(facultyDataDir, { recursive: true });
}

// ==================== HELPER FUNCTIONS ====================

// Get faculty registry
function getFacultyRegistry() {
  try {
    if (!fs.existsSync(registryPath)) {
      fs.writeFileSync(registryPath, JSON.stringify([], null, 2));
      return [];
    }
    return JSON.parse(fs.readFileSync(registryPath, "utf8"));
  } catch (err) {
    console.error("❌ Error reading registry:", err);
    return [];
  }
}

// Save faculty registry
function saveFacultyRegistry(registry) {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), "utf8");
}

// Get individual faculty data
function getFacultyData(facultyId) {
  const filePath = path.join(facultyDataDir, `${facultyId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Save individual faculty data
function saveFacultyData(facultyId, data) {
  const filePath = path.join(facultyDataDir, `${facultyId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Validate faculty ID format
function isValidFacultyID(facultyID) {
  // Only allow alphanumeric, underscore, dot, hyphen
  const regex = /^[a-zA-Z0-9._-]+$/;
  return regex.test(facultyID) && facultyID.length >= 3 && facultyID.length <= 50;
}

// ==================== API ENDPOINTS ====================

// 1. Get all faculty (list from registry)
app.get("/api/faculty", (req, res) => {
  try {
    const registry = getFacultyRegistry();
    res.json(registry.map(f => ({
      facultyID: f.facultyID,
      name: f.name,
      email: f.email,
      department: f.department,
      lastUpdated: f.lastUpdated,
      registeredAt: f.registeredAt
    })));
  } catch (err) {
    console.error("❌ Error fetching faculty list:", err);
    res.status(500).json({ message: "Error fetching faculty list" });
  }
});

// 2. Get specific faculty data
app.get("/api/faculty/:facultyId", (req, res) => {
  const { facultyId } = req.params;
  
  try {
    const facultyData = getFacultyData(facultyId);
    
    if (!facultyData) {
      return res.status(404).json({ 
        message: `Faculty with ID "${facultyId}" not found`,
        hint: "Use GET /api/faculty to see all registered faculty"
      });
    }
    
    res.json(facultyData);
  } catch (err) {
    console.error(`❌ Error reading faculty data for ${facultyId}:`, err);
    res.status(500).json({ message: "Error reading faculty data" });
  }
});

// 3. Register a new faculty with their Google Sheet ID
app.post("/api/faculty/register/:secretKey", async (req, res) => {
  const { secretKey } = req.params;
  const { facultyID, sheetID, name, email, department } = req.body;
  
  // Validate secret key
  if (secretKey !== REFRESH_SECRET_KEY) {
    return res.status(401).json({ 
      message: "Unauthorized - Invalid secret key",
      success: false 
    });
  }
  
  // Validate required fields
  if (!facultyID || !sheetID) {
    return res.status(400).json({ 
      message: "facultyID and sheetID are required",
      success: false
    });
  }
  
  // Validate faculty ID format
  if (!isValidFacultyID(facultyID)) {
    return res.status(400).json({ 
      message: "Invalid facultyID format. Use only letters, numbers, dots, underscores, and hyphens (3-50 chars)",
      example: "prof_john_doe or cs_ramesh_kumar or john.doe",
      success: false
    });
  }
  
  try {
    const registry = getFacultyRegistry();
    
    // Check if faculty already exists
    const existingIndex = registry.findIndex(f => f.facultyID === facultyID);
    
    // Check if sheetID is already used by another faculty
    const existingSheet = registry.find(f => f.sheetID === sheetID && f.facultyID !== facultyID);
    if (existingSheet) {
      return res.status(400).json({
        message: `Sheet ID already registered to faculty: ${existingSheet.facultyID}`,
        existingFaculty: existingSheet.facultyID,
        success: false
      });
    }
    
    const facultyEntry = {
      facultyID,
      sheetID,
      name: name || "",
      email: email || "",
      department: department || "",
      jsonFile: `${facultyID}.json`,
      registeredAt: existingIndex >= 0 ? registry[existingIndex].registeredAt : new Date().toISOString(),
      lastUpdated: null
    };
    
    if (existingIndex >= 0) {
      console.log(`📝 Updating existing faculty: ${facultyID}`);
      registry[existingIndex] = facultyEntry;
    } else {
      console.log(`✨ Registering new faculty: ${facultyID}`);
      registry.push(facultyEntry);
    }
    
    saveFacultyRegistry(registry);
    
    res.json({ 
      message: `Faculty ${facultyID} registered successfully`,
      faculty: facultyEntry,
      dataFilePath: `backend/data/faculty/${facultyID}.json`,
      success: true,
      nextStep: `Use GET /api/faculty/${facultyID}/refresh/${secretKey} to fetch data from Google Sheets`
    });
  } catch (err) {
    console.error("❌ Error registering faculty:", err);
    res.status(500).json({ 
      message: "Error registering faculty: " + err.message,
      success: false
    });
  }
});

// 4. Fetch/Update data for a specific faculty from their Google Sheet
app.get("/api/faculty/:facultyId/refresh/:secretKey", async (req, res) => {
  const { facultyId, secretKey } = req.params;
  
  // Validate secret key
  if (secretKey !== REFRESH_SECRET_KEY) {
    return res.status(401).json({ 
      message: "Unauthorized - Invalid secret key",
      success: false
    });
  }
  
  try {
    const registry = getFacultyRegistry();
    const faculty = registry.find(f => f.facultyID === facultyId);
    
    if (!faculty) {
      return res.status(404).json({ 
        message: `Faculty ${facultyId} not registered. Please register first.`,
        hint: `Use POST /api/faculty/register/${secretKey} to register`,
        success: false
      });
    }
    
    console.log(`🔄 Fetching data from Google Sheet for ${facultyId}...`);
    
    // Fetch data from faculty's Google Sheet
    const sheetData = await generateFacultyJSONFromSheet(faculty.sheetID);
    
    // Save individual faculty data
    saveFacultyData(facultyId, sheetData);
    
    // Update last updated timestamp in registry
    faculty.lastUpdated = new Date().toISOString();
    saveFacultyRegistry(registry);
    
    console.log(`✅ Data for ${facultyId} updated successfully`);
    
    res.json({ 
      message: `Data for ${facultyId} updated successfully from Google Sheets`,
      facultyID: facultyId,
      lastUpdated: faculty.lastUpdated,
      sheetID: faculty.sheetID,
      success: true
    });
    
  } catch (err) {
    console.error(`❌ Error refreshing data for ${facultyId}:`, err);
    res.status(500).json({ 
      message: "Error fetching data from Google Sheet: " + err.message,
      success: false
    });
  }
});

// 5. Refresh all faculty data from their respective sheets
app.get("/api/faculty/refreshAll/:secretKey", async (req, res) => {
  const { secretKey } = req.params;
  
  if (secretKey !== REFRESH_SECRET_KEY) {
    return res.status(401).json({ 
      message: "Unauthorized - Invalid secret key",
      success: false
    });
  }
  
  try {
    const registry = getFacultyRegistry();
    
    if (registry.length === 0) {
      return res.json({
        message: "No faculty registered yet",
        success: true,
        results: []
      });
    }
    
    console.log(`🔄 Refreshing data for ${registry.length} faculty members...`);
    
    const results = [];
    
    for (const faculty of registry) {
      try {
        console.log(`  Fetching ${faculty.facultyID}...`);
        const sheetData = await generateFacultyJSONFromSheet(faculty.sheetID);
        saveFacultyData(faculty.facultyID, sheetData);
        faculty.lastUpdated = new Date().toISOString();
        
        results.push({
          facultyID: faculty.facultyID,
          status: "success",
          lastUpdated: faculty.lastUpdated
        });
      } catch (err) {
        console.error(`  ❌ Error for ${faculty.facultyID}:`, err.message);
        results.push({
          facultyID: faculty.facultyID,
          status: "failed",
          error: err.message
        });
      }
    }
    
    saveFacultyRegistry(registry);
    
    const successCount = results.filter(r => r.status === "success").length;
    const failCount = results.filter(r => r.status === "failed").length;
    
    console.log(`✅ Bulk refresh completed: ${successCount} succeeded, ${failCount} failed`);
    
    res.json({ 
      message: `Bulk refresh completed: ${successCount} succeeded, ${failCount} failed`,
      totalFaculty: registry.length,
      success: true,
      results
    });
    
  } catch (err) {
    console.error("❌ Error during bulk refresh:", err);
    res.status(500).json({ 
      message: "Error during bulk refresh: " + err.message,
      success: false
    });
  }
});

// 6. Delete a faculty
app.delete("/api/faculty/:facultyId/:secretKey", (req, res) => {
  const { facultyId, secretKey } = req.params;
  
  if (secretKey !== REFRESH_SECRET_KEY) {
    return res.status(401).json({ 
      message: "Unauthorized - Invalid secret key",
      success: false
    });
  }
  
  try {
    let registry = getFacultyRegistry();
    const facultyExists = registry.find(f => f.facultyID === facultyId);
    
    if (!facultyExists) {
      return res.status(404).json({
        message: `Faculty ${facultyId} not found`,
        success: false
      });
    }
    
    registry = registry.filter(f => f.facultyID !== facultyId);
    saveFacultyRegistry(registry);
    
    // Delete individual data file
    const filePath = path.join(facultyDataDir, `${facultyId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    console.log(`🗑️  Faculty ${facultyId} deleted successfully`);
    
    res.json({ 
      message: `Faculty ${facultyId} deleted successfully`,
      success: true
    });
  } catch (err) {
    console.error("❌ Error deleting faculty:", err);
    res.status(500).json({ 
      message: "Error deleting faculty: " + err.message,
      success: false
    });
  }
});

// 7. Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "Backend running",
    totalFaculty: getFacultyRegistry().length
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Registered faculty: ${getFacultyRegistry().length}`);
});
