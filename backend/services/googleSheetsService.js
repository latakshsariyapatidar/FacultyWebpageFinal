/**
 * Google Sheets Service
 * Handles all interactions with Google Sheets API
 * Fetches and processes faculty data from Google Sheets
 * 
 * @module services/googleSheetsService
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const { google: googleConfig, sheets: sheetsConfig, paths } = config;

/**
 * Initialize Google Auth with environment variable or file
 * 
 * @returns {GoogleAuth} Google Auth instance
 */
function getGoogleAuth() {
  try {
    let credentials;

    // Check if credentials are in environment variable (for production/Vercel)
    if (googleConfig.serviceAccountBase64) {
      logger.info('Using Google credentials from environment variable');
      const base64Credentials = googleConfig.serviceAccountBase64;
      const credentialsString = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      credentials = JSON.parse(credentialsString);

      return new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: googleConfig.scopes,
      });
    }
    // Fallback to file (for local development)
    else {
      logger.info('Using Google credentials from file');
      const keyFilePath = path.join(paths.root, googleConfig.credentialsFile);

      if (!fs.existsSync(keyFilePath)) {
        throw new Error(
          `Google credentials file not found: ${googleConfig.credentialsFile}. ` +
          `Please add credentials file or set GOOGLE_SERVICE_ACCOUNT_BASE64 environment variable.`
        );
      }

      return new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: googleConfig.scopes,
      });
    }
  } catch (error) {
    logger.error('Error initializing Google Auth:', error);
    throw error;
  }
}

/**
 * Convert spreadsheet rows to objects
 * 
 * @param {Array} rows - Array of rows from spreadsheet
 * @returns {Array} Array of objects with header as keys
 */
function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) =>
    headers.reduce((obj, header, i) => {
      obj[header] = row[i] || '';
      return obj;
    }, {})
  );
}

/**
 * Fetch and process faculty data from Google Sheet
 * 
 * @param {string} sheetID - The Google Sheet ID for the faculty
 * @returns {Promise<Object>} Processed faculty data object
 */
export async function fetchFacultyDataFromSheet(sheetID) {
  try {
    logger.document(`Fetching data from sheet: ${sheetID}`);

    const auth = getGoogleAuth();
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    /**
     * Helper to fetch from specific sheet with error handling
     * @param {string} sheetName - Name of the sheet/tab
     * @param {string} range - Cell range to fetch
     * @returns {Promise<Array>} Sheet data rows
     */
    const fetchSheetData = async (sheetName, range = sheetsConfig.defaultRange) => {
      try {
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetID,
          range: `${sheetName}!${range}`,
        });
        return res.data.values || [];
      } catch (error) {
        logger.warn(`Sheet "${sheetName}" not found or empty, skipping...`);
        return [];
      }
    };

    // Fetch all sheets with error handling
    const SHEETS = sheetsConfig.names;

    const [
      personalRows,
      aboutRows,
      researchRows,
      linksRows,
      experienceRows,
      educationRows,
      coursesRows,
      interestsRows,
      fundingRows,
      reqRows,
      patentsRows,
      journalsRows,
      confRows,
      bookChaptersRows,
      instrRows,
      currentRows,
      graduatedRows,
      newsRows,
      imageRows,
      statsRows,
      resourcesRows,
    ] = await Promise.all([
      fetchSheetData(SHEETS.personalInfo),
      fetchSheetData(SHEETS.about),
      fetchSheetData(SHEETS.researchPositions),
      fetchSheetData(SHEETS.links),
      fetchSheetData(SHEETS.experience),
      fetchSheetData(SHEETS.education),
      fetchSheetData(SHEETS.courses),
      fetchSheetData(SHEETS.researchInterests),
      fetchSheetData(SHEETS.fundingInfo),
      fetchSheetData(SHEETS.fundingRequirements),
      fetchSheetData(SHEETS.patents),
      fetchSheetData(SHEETS.journals),
      fetchSheetData(SHEETS.conferences),
      fetchSheetData(SHEETS.bookChapters),
      fetchSheetData(SHEETS.studentInstructions),
      fetchSheetData(SHEETS.currentStudents),
      fetchSheetData(SHEETS.graduatedStudents),
      fetchSheetData(SHEETS.news),
      fetchSheetData(SHEETS.image),
      fetchSheetData(SHEETS.stats),
      fetchSheetData(SHEETS.resources),
    ]);

    // Convert rows to objects
    const personal = rowsToObjects(personalRows);
    const about = rowsToObjects(aboutRows);
    const research = rowsToObjects(researchRows);
    const links = rowsToObjects(linksRows);
    const experience = rowsToObjects(experienceRows);
    const education = rowsToObjects(educationRows);
    const courses = rowsToObjects(coursesRows).map((c) => ({
      ...c,
      credits: Number(c.credits) || 0,
      status: c.status || 'current',
    }));
    const interests = rowsToObjects(interestsRows);
    const funding = rowsToObjects(fundingRows);
    const requirements = rowsToObjects(reqRows);
    const patents = rowsToObjects(patentsRows);
    const journals = rowsToObjects(journalsRows);
    const conferences = rowsToObjects(confRows);
    const bookChapters = rowsToObjects(bookChaptersRows);
    const instructions = rowsToObjects(instrRows);
    const currentStudents = rowsToObjects(currentRows);
    const graduatedStudents = rowsToObjects(graduatedRows);
    const news = rowsToObjects(newsRows);
    const images = rowsToObjects(imageRows);
    const stats = rowsToObjects(statsRows);
    const resources = rowsToObjects(resourcesRows);

    // Build faculty data
    const personalInfo = personal[0] || {};
    const facultyId = personalInfo.faculty_id || personalInfo.facultyID || 'unknown';

    // Process funding info
    const fundingInfo = {};
    funding.forEach((row) => {
      const field = row.field;
      const value = row.value;
      if (field && value) {
        fundingInfo[field] = value;
      }

      if (row.phd_application_link) fundingInfo.phd_application_link = row.phd_application_link;
      if (row.phd_email_template) fundingInfo.phd_email_template = row.phd_email_template;
      if (row.mtech_application_link) fundingInfo.mtech_application_link = row.mtech_application_link;
      if (row.mtech_email_template) fundingInfo.mtech_email_template = row.mtech_email_template;
    });

    const facultyData = {
      faculty_id: facultyId,
      facultyID: facultyId,
      personalInfo: personalInfo,
      about: {
        ...about[0],
        researchPositions: research.map((r) => ({
          position: r.Position || r.position || r.field || '',
          application_link: r.application_link || r.applicationLink || '',
          email_template: r.email_template || r.emailTemplate || '',
        })),
        links: links,
      },
      biography: {
        experience: experience,
        education: education,
      },
      courses: courses,
      research: {
        interests: interests.map((i) => ({
          title: i.title || i.Title || i.Interest || i.interest || '',
          description: i.description || i.Description || '',
          image: i.image || i.Image || '',
        })),
        fundingInfo: {
          phdPositions: fundingInfo.phdPositions || '',
          mtechPositions: fundingInfo.mtechPositions || '',
          note: fundingInfo.note || '',
          phd_application_link: fundingInfo.phd_application_link || '',
          phd_email_template: fundingInfo.phd_email_template || '',
          mtech_application_link: fundingInfo.mtech_application_link || '',
          mtech_email_template: fundingInfo.mtech_email_template || '',
          requirements: requirements.map((r) => ({
            position_id: r.position_id || r.positionId || '',
            requirement: r.requirement || r.Requirement || r.field || r.value || '',
          })),
        },
      },
      publications: {
        patents: patents.map((p) => ({
          ...p,
          pdf_link: p.pdf_link || p.pdfLink || '',
          external_link: p.external_link || p.externalLink || '',
        })),
        journals: journals.map((j) => ({
          ...j,
          pdf_link: j.pdf_link || j.pdfLink || '',
          external_link: j.external_link || j.externalLink || '',
        })),
        conferences: conferences.map((c) => ({
          ...c,
          pdf_link: c.pdf_link || c.pdfLink || '',
          external_link: c.external_link || c.externalLink || '',
        })),
        bookChapters: bookChapters.map((b) => ({
          ...b,
          pdf_link: b.pdf_link || b.pdfLink || '',
          external_link: b.external_link || b.externalLink || '',
        })),
      },
      students: {
        instructions: instructions.map((i) => i.instruction || i.Instruction || i.field || ''),
        current: currentStudents.map((s) => ({
          ...s,
          degree_type: s.degree_type || s.degreeType || s.program || 'PhD',
          photo: s.photo || s.Photo || '',
          thesis_title: s.thesis_title || s.thesisTitle || s.topic || '',
          start_date: s.start_date || s.startDate || '',
          end_date: s.end_date || s.endDate || '',
        })),
        graduated: graduatedStudents.map((s) => ({
          ...s,
          degree_type: s.degree_type || s.degreeType || s.program || 'PhD',
          photo: s.photo || s.Photo || '',
          thesis_title: s.thesis_title || s.thesisTitle || s.thesis || '',
          start_date: s.start_date || s.startDate || '',
          end_date: s.end_date || s.endDate || s.year || '',
        })),
      },
      news: news
        .map((n) => ({
          title: n.title || n.Title || '',
          description:
            n.description || n.Description || n.content || n.Content ||
            n.news || n.News || n.text || n.Text || '',
          image: n.image || n.Image || n.photo || n.Photo || '',
          date:
            n.date || n.Date || n.published_date || n.publishedDate ||
            n.published || n.Published || '',
        }))
        .filter((item) => item.title || item.description),
      gallery: images.map((img) => ({
        url: img.gallery_images || img.gallery_image || '',
        alt: img.image_alternate_text || img.alt_text || '',
        caption: img.caption || img.Caption || '',
        caption_position: img.caption_position || img.captionPosition || 'after',
      })),
      statistics: stats.map((s) => ({
        label: s.label || s.Label || s.name || s.Name || '',
        value: s.value || s.Value || s.count || s.Count || '0',
        icon: s.icon || s.Icon || '',
        description: s.description || s.Description || '',
      })),
      resources: resources
        .map((r) => ({
          title: r.title || r.Title || '',
          description: r.description || r.Description || '',
          link: r.link || r.Link || r.drive_link || r.driveLink || '',
          category: r.category || r.Category || r.type || r.Type || '',
          date: r.date || r.Date || r.uploaded_date || r.uploadedDate || '',
        }))
        .filter((r) => r.title || r.link),
      lastFetched: new Date().toISOString(),
    };

    logger.success(`Successfully fetched data for faculty: ${facultyId}`);
    return facultyData;
  } catch (error) {
    logger.error(`Error fetching sheet ${sheetID}:`, error);
    throw new Error(`Failed to fetch data from Google Sheet: ${error.message}`);
  }
}
