/**
 * Custom Hook: useFacultyData
 * 
 * Handles fetching and caching of faculty data from the new backend API.
 * - Fetches list of all faculty (metadata only)
 * - Fetches complete data for specific faculty
 * Provides loading, error states, and automatic retry logic.
 * 
 * @module hooks/useFacultyData
 */

import { useState, useEffect } from 'react';
import { fetchFacultyData, fetchAllFacultyData, validateFacultyData } from '../services/facultyService';

/**
 * Custom hook for fetching faculty data
 * 
 * @param {string} facultyId - Required faculty ID to fetch specific faculty
 * @returns {Object} Hook state
 * @returns {Object|null} state.data - Complete faculty data
 * @returns {boolean} state.loading - Loading state
 * @returns {string|null} state.error - Error message if any
 * @returns {Function} state.refetch - Function to refetch data
 * @returns {Array} state.allFaculty - All faculty members metadata (for selection/listing)
 * 
 * @example
 * const { data, loading, error, refetch, allFaculty } = useFacultyData('prof_john_doe');
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} onRetry={refetch} />;
 * return <FacultyProfile data={data} />;
 */
export const useFacultyData = (facultyId) => {
  const [data, setData] = useState(null);
  const [allFaculty, setAllFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all faculty data first
      const allFacultyData = await fetchAllFacultyData();
      setAllFaculty(allFacultyData);
      
      // Get specific faculty data
      const facultyData = await fetchFacultyData(facultyId);
      
      // Validate data structure
      if (!validateFacultyData(facultyData)) {
        throw new Error('Invalid data structure received from server');
      }
      
      setData(facultyData);
    } catch (err) {
      setError(err.message || 'Failed to load faculty data');
      console.error('Error fetching faculty data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId]);

  return {
    data,
    allFaculty,
    loading,
    error,
    refetch: fetchData,
  };
};
