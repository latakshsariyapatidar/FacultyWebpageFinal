# 🚀 Quick Start Guide

## Backend Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file in the `backend` directory:
```env
REFRESH_SECRET_KEY=your_secure_secret_key_here
PORT=5000
GOOGLE_SERVICE_ACCOUNT_BASE64=your_base64_credentials
```

### 3. Add Google Service Account Credentials

**Option A: Using environment variable (recommended for production)**
```bash
# Convert JSON to base64
cat your-credentials.json | base64 > credentials.txt
# Copy the content to GOOGLE_SERVICE_ACCOUNT_BASE64 in .env
```

**Option B: Using file (for local development)**
```bash
# Place your credentials file in backend/
cp ~/Downloads/facultywebpage-xxx.json backend/
```
Then update `.env`:
```env
GOOGLE_CREDENTIALS_FILE=./facultywebpage-xxx.json
```

### 4. Start the Server
```bash
npm start
```

You should see:
```
✅ Server running on http://localhost:5000
📊 Registered faculty: 0
```

## Quick Test

### 1. Check Server Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "Backend running",
  "totalFaculty": 0
}
```

### 2. Open Admin Panel
Open in browser: `http://localhost:5000/../test-admin.html`

or from the root directory:
```bash
# Windows
start test-admin.html

# Mac/Linux
open test-admin.html
```

## Register Your First Faculty

### Step 1: Prepare Google Sheet
1. Create a Google Sheet with required tabs (see backend/README.md)
2. Share with service account email (found in your credentials JSON)
3. Copy Sheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/1ABC123XYZ456.../edit
                                          ↑ This part
   ```

### Step 2: Register via Admin Panel
1. Open `test-admin.html` in browser
2. Fill in the form:
   - **Faculty ID**: `test_professor` (example)
   - **Sheet ID**: Paste from Step 1
   - **Name**: Dr. Test Professor
   - **Email**: test@iitdh.ac.in (optional)
   - **Department**: Computer Science (optional)
   - **Secret Key**: Your secret from `.env`
3. Click "✅ Register Faculty"

### Step 3: Fetch Data
1. In the "Refresh Single Faculty Data" section:
   - **Faculty ID**: `test_professor`
   - **Secret Key**: Your secret
2. Click "🔄 Fetch Data from Sheet"

Data will be saved to `backend/data/faculty/test_professor.json`

### Step 4: View Data
Open in browser or use curl:
```bash
curl http://localhost:5000/api/faculty/test_professor
```

## Common Commands

### Register faculty via API
```bash
curl -X POST http://localhost:5000/api/faculty/register/YOUR_SECRET_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "facultyID": "prof_john",
    "sheetID": "1ABC123...",
    "name": "Dr. John Doe"
  }'
```

### Refresh faculty data
```bash
curl http://localhost:5000/api/faculty/prof_john/refresh/YOUR_SECRET_KEY
```

### Get all faculty
```bash
curl http://localhost:5000/api/faculty
```

### Get specific faculty
```bash
curl http://localhost:5000/api/faculty/prof_john
```

### Delete faculty
```bash
curl -X DELETE http://localhost:5000/api/faculty/prof_john/YOUR_SECRET_KEY
```

## Troubleshooting

### "Error: Google credentials not found"
- Check `.env` file has `GOOGLE_SERVICE_ACCOUNT_BASE64` or `GOOGLE_CREDENTIALS_FILE`
- Verify credentials file exists and is valid JSON

### "Error: Failed to fetch from Google Sheet"
- Verify sheet is shared with service account email
- Check Sheet ID is correct
- Ensure sheet has required tabs (at least `Personal_Info`)

### "Unauthorized - Invalid secret key"
- Check `REFRESH_SECRET_KEY` in `.env` matches the key you're using
- Restart server after changing `.env`

### Server won't start / Port already in use
```bash
# Windows: Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

## Next Steps

1. ✅ Register all your faculty members
2. ✅ Set up automated refresh (cron job or GitHub Actions)
3. ✅ Update frontend to use new endpoints
4. ✅ Configure production environment variables
5. ✅ Deploy to your hosting platform

## Useful Links

- **Admin Panel**: Open `test-admin.html` in browser
- **API Docs**: See `backend/README.md`
- **Architecture**: View the Mermaid diagrams in this repo
- **Google Sheets API**: https://developers.google.com/sheets/api

## Support

If you encounter issues:
1. Check server console for error messages
2. Review `backend/README.md` for detailed documentation
3. Verify Google Sheet structure matches expected format
4. Check that all environment variables are set correctly

Happy coding! 🎉
