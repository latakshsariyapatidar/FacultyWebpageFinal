import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Google Auth with environment variable or file
function getGoogleAuth() {
  try {
    let credentials;

    // Check if credentials are in environment variable (for production/Vercel)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
      console.log('📱 Using Google credentials from environment variable');
      const base64Credentials = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
      const credentialsString = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      credentials = JSON.parse(credentialsString);
      
      return new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });
    } 
    // Fallback to file (for local development)
    else {
      console.log('📁 Using Google credentials from file');
      const keyFilePath = process.env.GOOGLE_CREDENTIALS_FILE || './facultywebpage-e21344a1bd2a.json';
      
      if (!fs.existsSync(path.join(__dirname, keyFilePath))) {
        throw new Error(`Google credentials file not found: ${keyFilePath}. Please add credentials file or set GOOGLE_SERVICE_ACCOUNT_BASE64 environment variable.`);
      }
      
      return new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });
    }
  } catch (error) {
    console.error('❌ Error initializing Google Auth:', error.message);
    throw error;
  }
}

// Sheet names
const SHEETS = {
  links: "Links",
  experience: "Experience",
  education: "Education",
  courses: "Courses",
  researchInterests: "Research_Interests",
  fundingInfo: "Funding_Info",
  fundingRequirements: "Funding_Requirements",
  patents: "Patents",
  journals: "Journals",
  conferences: "Conferences",
  bookChapters: "Book_Chapters",
  studentInstructions: "Student_Instructions",
  currentStudents: "Current_Students",
  graduatedStudents: "Graduated_Students",
  personalInfo: "Personal_Info",
  about: "About",
  researchPositions: "Research_Positions",
  news: "News",
  image: "Image",
  stats: "Stats",
  resources: "Resources",
};

// Fetch sheet data from a specific spreadsheet
async function fetchSheet(spreadsheetId, sheetName, range = "A1:Z100") {
  const auth = getGoogleAuth();
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: `${sheetName}!${range}`,
  });

  return res.data.values || [];
}

// Convert rows to objects
function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) =>
    headers.reduce((obj, header, i) => {
      obj[header] = row[i] || "";
      return obj;
    }, {})
  );
}

/**
 * Generate JSON for a specific faculty's Google Sheet
 * @param {string} sheetID - The Google Sheet ID for the faculty
 * @returns {Promise<Object>} - Faculty data object
 */
export async function generateFacultyJSONFromSheet(sheetID) {
  try {
    console.log(`📄 Fetching data from sheet: ${sheetID}`);
    
    const auth = getGoogleAuth();
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Helper to fetch from specific sheet with error handling
    const fetchSheetData = async (sheetName, range = "A1:Z100") => {
      try {
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetID,
          range: `${sheetName}!${range}`,
        });
        return res.data.values || [];
      } catch (error) {
        console.log(`  ⚠️  Sheet "${sheetName}" not found or empty, skipping...`);
        return [];
      }
    };

    // Fetch all sheets with error handling
    const personalRows = await fetchSheetData(SHEETS.personalInfo);
    const personal = rowsToObjects(personalRows);

    const aboutRows = await fetchSheetData(SHEETS.about);
    const about = rowsToObjects(aboutRows);

    const researchRows = await fetchSheetData(SHEETS.researchPositions);
    const research = rowsToObjects(researchRows);

    const linksRows = await fetchSheetData(SHEETS.links);
    const links = rowsToObjects(linksRows);

    const experienceRows = await fetchSheetData(SHEETS.experience);
    const experience = rowsToObjects(experienceRows);

    const educationRows = await fetchSheetData(SHEETS.education);
    const education = rowsToObjects(educationRows);

    const coursesRows = await fetchSheetData(SHEETS.courses);
    const courses = rowsToObjects(coursesRows).map((c) => ({ 
      ...c, 
      credits: Number(c.credits) || 0,
      status: c.status || 'current'
    }));

    const interestsRows = await fetchSheetData(SHEETS.researchInterests);
    const interests = rowsToObjects(interestsRows);

    const fundingRows = await fetchSheetData(SHEETS.fundingInfo);
    const funding = rowsToObjects(fundingRows);

    const reqRows = await fetchSheetData(SHEETS.fundingRequirements);
    const requirements = rowsToObjects(reqRows);

    const patentsRows = await fetchSheetData(SHEETS.patents);
    const patents = rowsToObjects(patentsRows);

    const journalsRows = await fetchSheetData(SHEETS.journals);
    const journals = rowsToObjects(journalsRows);

    const confRows = await fetchSheetData(SHEETS.conferences);
    const conferences = rowsToObjects(confRows);

    const bookChaptersRows = await fetchSheetData(SHEETS.bookChapters);
    const bookChapters = rowsToObjects(bookChaptersRows);

    const instrRows = await fetchSheetData(SHEETS.studentInstructions);
    const instructions = rowsToObjects(instrRows);

    const currentRows = await fetchSheetData(SHEETS.currentStudents);
    const currentStudents = rowsToObjects(currentRows);

    const graduatedRows = await fetchSheetData(SHEETS.graduatedStudents);
    const graduatedStudents = rowsToObjects(graduatedRows);

    const newsRows = await fetchSheetData(SHEETS.news);
    const news = rowsToObjects(newsRows);

    const imageRows = await fetchSheetData(SHEETS.image);
    const images = rowsToObjects(imageRows);

    const statsRows = await fetchSheetData(SHEETS.stats);
    const stats = rowsToObjects(statsRows);

    const resourcesRows = await fetchSheetData(SHEETS.resources);
    const resources = rowsToObjects(resourcesRows);

    // Build faculty data (single faculty per sheet)
    const personalInfo = personal[0] || {};
    const facultyId = personalInfo.faculty_id || personalInfo.facultyID || "unknown";

    const facultyData = {
      faculty_id: facultyId,
      facultyID: facultyId,
      personalInfo: personalInfo,
      about: {
        ...about[0],
        researchPositions: research.map(r => ({
          position: r.Position || r.position || r.field || '',
          application_link: r.application_link || r.applicationLink || '',
          email_template: r.email_template || r.emailTemplate || ''
        })),
        links: links,
      },
      biography: {
        experience: experience,
        education: education,
      },
      courses: courses,
      research: {
        interests: interests.map(i => ({
          title: i.title || i.Title || i.Interest || i.interest || '',
          description: i.description || i.Description || '',
          image: i.image || i.Image || ''
        })),
        fundingInfo: (() => {
          const fundingObj = {};
          
          funding.forEach(row => {
            const field = row.field;
            const value = row.value;
            if (field && value) {
              fundingObj[field] = value;
            }
            
            if (row.phd_application_link) fundingObj.phd_application_link = row.phd_application_link;
            if (row.phd_email_template) fundingObj.phd_email_template = row.phd_email_template;
            if (row.mtech_application_link) fundingObj.mtech_application_link = row.mtech_application_link;
            if (row.mtech_email_template) fundingObj.mtech_email_template = row.mtech_email_template;
          });
          
          return {
            phdPositions: fundingObj.phdPositions || '',
            mtechPositions: fundingObj.mtechPositions || '',
            note: fundingObj.note || '',
            phd_application_link: fundingObj.phd_application_link || '',
            phd_email_template: fundingObj.phd_email_template || '',
            mtech_application_link: fundingObj.mtech_application_link || '',
            mtech_email_template: fundingObj.mtech_email_template || '',
            requirements: requirements.map(r => ({
              position_id: r.position_id || r.positionId || '',
              requirement: r.requirement || r.Requirement || r.field || r.value || ''
            }))
          };
        })()
      },
      publications: {
        patents: patents.map(p => ({
          ...p,
          pdf_link: p.pdf_link || p.pdfLink || '',
          external_link: p.external_link || p.externalLink || ''
        })),
        journals: journals.map(j => ({
          ...j,
          pdf_link: j.pdf_link || j.pdfLink || '',
          external_link: j.external_link || j.externalLink || ''
        })),
        conferences: conferences.map(c => ({
          ...c,
          pdf_link: c.pdf_link || c.pdfLink || '',
          external_link: c.external_link || c.externalLink || ''
        })),
        bookChapters: bookChapters.map(b => ({
          ...b,
          pdf_link: b.pdf_link || b.pdfLink || '',
          external_link: b.external_link || b.externalLink || ''
        }))
      },
      students: {
        instructions: instructions.map(i => i.instruction || i.Instruction || i.field || ''),
        current: currentStudents.map(s => ({
          ...s,
          degree_type: s.degree_type || s.degreeType || s.program || 'PhD',
          photo: s.photo || s.Photo || '',
          thesis_title: s.thesis_title || s.thesisTitle || s.topic || '',
          start_date: s.start_date || s.startDate || '',
          end_date: s.end_date || s.endDate || ''
        })),
        graduated: graduatedStudents.map(s => ({
          ...s,
          degree_type: s.degree_type || s.degreeType || s.program || 'PhD',
          photo: s.photo || s.Photo || '',
          thesis_title: s.thesis_title || s.thesisTitle || s.thesis || '',
          start_date: s.start_date || s.startDate || '',
          end_date: s.end_date || s.endDate || s.year || ''
        })),
      },
      news: news.map(n => ({
        title: n.title || n.Title || '',
        description: n.description || n.Description || n.content || n.Content || 
                    n.news || n.News || n.text || n.Text || '',
        image: n.image || n.Image || n.photo || n.Photo || '',
        date: n.date || n.Date || n.published_date || n.publishedDate || 
              n.published || n.Published || ''
      })).filter(item => item.title || item.description),
      gallery: images.map(img => ({
        url: img.gallery_images || img.gallery_image || '',
        alt: img.image_alternate_text || img.alt_text || '',
        caption: img.caption || img.Caption || '',
        caption_position: img.caption_position || img.captionPosition || 'after'
      })),
      statistics: stats.map(s => ({
        label: s.label || s.Label || s.name || s.Name || '',
        value: s.value || s.Value || s.count || s.Count || '0',
        icon: s.icon || s.Icon || '',
        description: s.description || s.Description || ''
      })),
      resources: resources.map(r => ({
        title: r.title || r.Title || '',
        description: r.description || r.Description || '',
        link: r.link || r.Link || r.drive_link || r.driveLink || '',
        category: r.category || r.Category || r.type || r.Type || '',
        date: r.date || r.Date || r.uploaded_date || r.uploadedDate || ''
      })).filter(r => r.title || r.link),
      lastFetched: new Date().toISOString()
    };

    console.log(`✅ Successfully fetched data for faculty: ${facultyId}`);
    return facultyData;
    
  } catch (error) {
    console.error(`❌ Error fetching sheet ${sheetID}:`, error);
    throw new Error(`Failed to fetch data from Google Sheet: ${error.message}`);
  }
}

// Generate JSON for all faculty (DEPRECATED - kept for backwards compatibility)
export async function generateAllFacultyJSON() {
  console.warn("⚠️  generateAllFacultyJSON is deprecated. Use individual faculty sheets instead.");
  throw new Error("This function is deprecated. Please use the new multi-faculty system.");
}
