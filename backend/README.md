# Faculty Management Backend

Multi-faculty Google Sheets integration system for managing individual faculty webpages.

## 🏗️ Architecture

```
backend/
├── server.js              # Express server with API endpoints
├── googleSheets.js        # Google Sheets integration
├── data/
│   ├── facultyRegistry.json    # Registry of all faculty
│   └── faculty/                # Individual faculty data files
│       ├── prof_john_doe.json
│       ├── prof_jane_smith.json
│       └── ...
```

## 🔑 Key Concepts

### Faculty Registry
- **File**: `data/facultyRegistry.json`
- **Purpose**: Maps faculty IDs to their Google Sheet IDs
- **Structure**:
```json
[
  {
    "facultyID": "prof_john_doe",
    "sheetID": "1ABC123XYZ456...",
    "name": "Dr. John Doe",
    "email": "john.doe@iitdh.ac.in",
    "department": "Computer Science",
    "jsonFile": "prof_john_doe.json",
    "registeredAt": "2026-02-13T10:00:00.000Z",
    "lastUpdated": "2026-02-13T10:30:00.000Z"
  }
]
```

### Individual Faculty Data
- **Location**: `data/faculty/{facultyID}.json`
- **Purpose**: Stores complete faculty information fetched from their Google Sheet
- **Format**: Same structure as previous `facultyData.json`

## 📡 API Endpoints

### 1. Get All Faculty (List)
```
GET /api/faculty
```
Returns list of all registered faculty with metadata.

**Response:**
```json
[
  {
    "facultyID": "prof_john_doe",
    "name": "Dr. John Doe",
    "email": "john.doe@iitdh.ac.in",
    "department": "Computer Science",
    "lastUpdated": "2026-02-13T10:30:00.000Z",
    "registeredAt": "2026-02-13T10:00:00.000Z"
  }
]
```

### 2. Get Specific Faculty Data
```
GET /api/faculty/:facultyId
```
Returns complete data for a specific faculty member.

**Example:**
```bash
GET /api/faculty/prof_john_doe
```

### 3. Register New Faculty
```
POST /api/faculty/register/:secretKey
```
Register a new faculty member with their Google Sheet ID.

**Body:**
```json
{
  "facultyID": "prof_john_doe",
  "sheetID": "1ABC123XYZ456...",
  "name": "Dr. John Doe",
  "email": "john.doe@iitdh.ac.in",
  "department": "Computer Science"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/faculty/register/YOUR_SECRET_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "facultyID": "prof_john_doe",
    "sheetID": "1ABC123XYZ456...",
    "name": "Dr. John Doe"
  }'
```

### 4. Refresh Single Faculty Data
```
GET /api/faculty/:facultyId/refresh/:secretKey
```
Fetch latest data from a specific faculty's Google Sheet.

**Example:**
```bash
GET /api/faculty/prof_john_doe/refresh/YOUR_SECRET_KEY
```

### 5. Refresh All Faculty Data
```
GET /api/faculty/refreshAll/:secretKey
```
Fetch data from all registered faculty Google Sheets.

**Example:**
```bash
GET /api/faculty/refreshAll/YOUR_SECRET_KEY
```

### 6. Delete Faculty
```
DELETE /api/faculty/:facultyId/:secretKey
```
Remove a faculty member and their data file.

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/faculty/prof_john_doe/YOUR_SECRET_KEY
```

### 7. Health Check
```
GET /health
```
Check server status and total registered faculty.

## 🚀 Getting Started

### Prerequisites
- Node.js 14+
- Google Service Account credentials
- Faculty Google Sheets (shared with service account)

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
Create a `.env` file:
```env
REFRESH_SECRET_KEY=your_secure_secret_key_here
PORT=5000
GOOGLE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_credentials
# OR use file path
GOOGLE_CREDENTIALS_FILE=./facultywebpage-e21344a1bd2a.json
```

3. **Start the server:**
```bash
npm start
```

## 🎓 Faculty Onboarding Workflow

### Step 1: Faculty Creates Google Sheet
1. Faculty creates a Google Sheet with required tabs (Personal_Info, About, etc.)
2. Faculty shares the sheet with the service account email
3. Faculty copies the Sheet ID from the URL

### Step 2: Admin Registers Faculty
Use the admin panel (`test-admin.html`) or API:

1. Open `http://localhost:5000/../test-admin.html`
2. Fill in the registration form:
   - **Faculty ID**: `prof_john_doe` (unique identifier)
   - **Sheet ID**: From Step 1
   - **Name, Email, Department**: Optional metadata
   - **Secret Key**: Admin secret
3. Click "Register Faculty"

### Step 3: Fetch Data
1. Click "Fetch Data from Sheet" for the registered faculty
2. Data is saved to `data/faculty/prof_john_doe.json`
3. Frontend can now access: `GET /api/faculty/prof_john_doe`

## 📊 Faculty ID Naming Convention

Faculty IDs must:
- Be 3-50 characters
- Use only: letters, numbers, dots, underscores, hyphens
- Be unique across all faculty

**Recommended formats:**
- `prof_john_doe` - Professor + name
- `cs_ramesh_kumar` - Department + name
- `john.doe` - Email-style
- `faculty_001` - Sequential numbering

## 🔐 Security

### Secret Key
- Set `REFRESH_SECRET_KEY` in `.env`
- Never commit `.env` to version control
- Required for all write operations (register, refresh, delete)

### Google Credentials
- Use `GOOGLE_SERVICE_ACCOUNT_BASE64` for production
- Or `GOOGLE_CREDENTIALS_FILE` for local development
- Never commit credentials to git

## 🛠️ Development

### Testing Endpoints

**View all faculty:**
```bash
curl http://localhost:5000/api/faculty
```

**Get specific faculty:**
```bash
curl http://localhost:5000/api/faculty/prof_john_doe
```

**Register faculty:**
```bash
curl -X POST http://localhost:5000/api/faculty/register/SECRET_KEY \
  -H "Content-Type: application/json" \
  -d '{"facultyID":"test_prof","sheetID":"1ABC..."}'
```

## 📝 Google Sheet Structure

Each faculty's Google Sheet should have these tabs:
- `Personal_Info` - Name, photo, designation, etc.
- `About` - About section content
- `Links` - Social/website links
- `Experience` - Work experience
- `Education` - Academic background
- `Courses` - Courses taught
- `Research_Interests` - Research areas
- `Funding_Info` - Available positions
- `Funding_Requirements` - Position requirements
- `Patents` - Patent publications
- `Journals` - Journal publications
- `Conferences` - Conference papers
- `Book_Chapters` - Book chapters
- `Student_Instructions` - Instructions for prospective students
- `Current_Students` - Current students
- `Graduated_Students` - Graduated students
- `News` - News/announcements
- `Image` - Gallery images
- `Stats` - Statistics
- `Resources` - Resources/files

## 🐛 Troubleshooting

### "Faculty not found"
- Check if faculty is registered: `GET /api/faculty`
- Verify facultyID spelling

### "Error fetching from Google Sheet"
- Verify sheet is shared with service account email
- Check Sheet ID is correct
- Ensure all required tabs exist

### "Unauthorized"
- Verify secret key matches `REFRESH_SECRET_KEY` in `.env`
- Check `.env` file is in backend directory

## 🔄 Migration from Old System

Old system had:
- Single Google Sheet (`SPREADSHEET_ID`)
- All faculty in one file (`facultyData.json`)

New system has:
- Individual Google Sheets per faculty
- Registry + individual files
- Each faculty manages their own sheet

**To migrate:**
1. Keep old `facultyData.json` for reference
2. Create individual sheets for each faculty
3. Register each faculty with their new sheet ID
4. Refresh data for each faculty
5. Update frontend to use new endpoints

## 📚 Additional Resources

- **Admin Panel**: Open `../test-admin.html` in browser
- **Frontend Integration**: Use `/api/faculty/:facultyId` endpoint
- **Google Sheets API**: [Documentation](https://developers.google.com/sheets/api)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check server logs for error messages
4. Verify Google Sheet structure matches expected format
