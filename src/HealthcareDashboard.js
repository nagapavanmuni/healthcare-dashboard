import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import axios from "axios";
import CityCostComparison from "./CityCostComparison";
import "./HealthcareDashboard.css";

const HealthcareDashboard = () => {
  const [activeView, setActiveView] = useState("overview");
  const [activeSettingsView, setActiveSettingsView] = useState("profile");
  const [theme, setTheme] = useState("light");
  const [showHelp, setShowHelp] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [healthcareData, setHealthcareData] = useState(null);
  const [loadingError, setLoadingError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "System Update",
      message: "New features have been added",
      date: "2025-03-20",
      read: false,
    },
    {
      id: 2,
      title: "Data Refresh",
      message: "Healthcare data has been updated",
      date: "2025-03-22",
      read: true,
    },
    {
      id: 3,
      title: "Cost Alert",
      message: "Unusual increase in procedure costs detected",
      date: "2025-03-23",
      read: false,
    },
  ]);
  const [userPreferences, setUserPreferences] = useState({
    dataRefreshInterval: "24h",
    defaultView: "overview",
    chartType: "bar",
    notifications: true,
    autoExport: false,
  });
  const [userProfile, setUserProfile] = useState({
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Healthcare Analyst",
    department: "Financial Analytics",
    lastLogin: "2025-03-23 09:45 AM",
  });

  const [maximizedChart, setMaximizedChart] = useState(null);

  const [filteredMetrics, setFilteredMetrics] = useState({
    filteredTotalExpenses: 0,
    filteredPatientCount: 0,
    filteredAvgClaimCost: 0,
  });

  const [selectedFilters, setSelectedFilters] = useState({
    ageGroup: "all",
    gender: "all",
    race: "all",
    condition: "all",
    location: "all",
    dateRange: "all",
    costRange: "all",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [tempFilters, setTempFilters] = useState({
    ageGroup: "all",
    gender: "all",
    race: "all",
    condition: "all",
    location: "all",
    dateRange: "all",
    costRange: "all",
  });

  // For cost prediction
  const [predictionParams, setPredictionParams] = useState({
    age: "40",
    gender: "male",
    condition: "diabetes",
    previousClaims: "2",
    region: "west",
  });

  const [predictionResults, setPredictionResults] = useState(null);

  // Cost trends over time (fallback data)
  const costTrendsData = [
    { month: "Jan", hospitalCosts: 1200, primaryCare: 800, medications: 600 },
    { month: "Feb", hospitalCosts: 1300, primaryCare: 750, medications: 650 },
    { month: "Mar", hospitalCosts: 1100, primaryCare: 800, medications: 700 },
    { month: "Apr", hospitalCosts: 1400, primaryCare: 850, medications: 600 },
    { month: "May", hospitalCosts: 1500, primaryCare: 900, medications: 550 },
    { month: "Jun", hospitalCosts: 1600, primaryCare: 950, medications: 650 },
  ];

  // Generate more realistic sample claims data
  function generateSampleClaimsData(count) {
    const procedures = [
      "Annual Checkup",
      "Blood Test",
      "X-Ray",
      "MRI Scan",
      "CT Scan",
      "Physical Therapy",
      "Vaccination",
      "Colonoscopy",
      "Dermatology Exam",
    ];

    const conditions = [
      "Hypertension",
      "Diabetes",
      "Asthma",
      "Arthritis",
      "Lower Back Pain",
      "Influenza",
      "Common Cold",
      "Allergies",
      "Preventive Care",
    ];

    const locations = [
      "hayward",
      "oakland",
      "san_francisco",
      "palo_alto",
      "san_jose",
    ];
    const genders = ["male", "female"];
    const races = ["white", "black", "asian", "hispanic", "other"];
    const ageGroups = ["0-18", "19-35", "36-50", "51-65", "65+"];

    const result = [];

    for (let i = 0; i < count; i++) {
      const baseCost = Math.floor(Math.random() * 5000) + 100;
      const coveragePercent = Math.floor(Math.random() * 30) + 60; // 60-90%

      result.push({
        date: `2025-0${Math.floor(Math.random() * 3) + 1}-${
          Math.floor(Math.random() * 28) + 1
        }`,
        procedure: procedures[Math.floor(Math.random() * procedures.length)],
        patientId: `P${Math.floor(Math.random() * 1000) + 1000}`,
        baseCost: baseCost,
        totalCost: Math.round(baseCost * 1.15 * 100) / 100,
        coveragePercent: coveragePercent,
        ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
        gender: genders[Math.floor(Math.random() * genders.length)],
        race: races[Math.floor(Math.random() * races.length)],
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
      });
    }

    return result;
  }

  // Default fallback data with more claims
  const fallbackData = {
    metrics: {
      totalPatients: 1250,
      totalExpenses: 1250000,
      avgClaimCost: 2500,
    },
    dashboardData: {
      expensesData: [
        {
          ageGroup: "0-18",
          White: 4500,
          Black: 4200,
          Asian: 3800,
          Hispanic: 4100,
          Other: 4300,
        },
        {
          ageGroup: "19-35",
          White: 5600,
          Black: 5100,
          Asian: 4800,
          Hispanic: 5300,
          Other: 5500,
        },
        {
          ageGroup: "36-50",
          White: 7200,
          Black: 6800,
          Asian: 6500,
          Hispanic: 7000,
          Other: 7100,
        },
        {
          ageGroup: "51-65",
          White: 9500,
          Black: 9000,
          Asian: 8700,
          Hispanic: 9200,
          Other: 9300,
        },
        {
          ageGroup: "65+",
          White: 12000,
          Black: 11500,
          Asian: 11000,
          Hispanic: 11700,
          Other: 11800,
        },
      ],
      proceduresData: [
        { name: "Heart Surgery", cost: 35000 },
        { name: "Joint Replacement", cost: 28000 },
        { name: "MRI Scan", cost: 2500 },
        { name: "Chemotherapy", cost: 18000 },
        { name: "Emergency Room Visit", cost: 1800 },
      ],
      payerCoverageData: [
        { name: "Medicare", value: 85 },
        { name: "Medicaid", value: 78 },
        { name: "Blue Cross", value: 92 },
        { name: "Aetna", value: 88 },
        { name: "UnitedHealth", value: 90 },
      ],
      claimsData: generateSampleClaimsData(500), // Generate more claims for better filtering
      payerAnalysisData: [
        { name: "Medicare", covered: 125000, uncovered: 25000, customers: 450 },
        { name: "Medicaid", covered: 80000, uncovered: 22000, customers: 320 },
        {
          name: "Blue Cross",
          covered: 180000,
          uncovered: 15000,
          customers: 280,
        },
        { name: "Aetna", covered: 150000, uncovered: 18000, customers: 220 },
        {
          name: "UnitedHealth",
          covered: 210000,
          uncovered: 20000,
          customers: 350,
        },
      ],
      costDriversData: [
        { category: "Chronic Conditions", cost: 5200.5, percentage: 28 },
        { category: "Acute Care", cost: 3800.25, percentage: 20 },
        { category: "Preventive Care", cost: 1500.75, percentage: 8 },
        { category: "Medications", cost: 4200.3, percentage: 23 },
        { category: "Procedures", cost: 3900.1, percentage: 21 },
      ],
      costByLocationData: [
        { location: "Hayward", avgCost: 3450, totalClaims: 320 },
        { location: "Oakland", avgCost: 4200, totalClaims: 450 },
        { location: "San Francisco", avgCost: 5300, totalClaims: 580 },
        { location: "Palo Alto", avgCost: 5100, totalClaims: 290 },
        { location: "San Jose", avgCost: 3800, totalClaims: 410 },
      ],
      costTrendByMonthData: [
        { month: "Jan", cost: 245000 },
        { month: "Feb", cost: 235000 },
        { month: "Mar", cost: 260000 },
        { month: "Apr", cost: 275000 },
        { month: "May", cost: 290000 },
        { month: "Jun", cost: 310000 },
      ],
      conditionCostData: [
        { condition: "Diabetes", averageCost: 12500, patientCount: 215 },
        { condition: "Hypertension", averageCost: 9800, patientCount: 320 },
        { condition: "Asthma", averageCost: 7500, patientCount: 180 },
        { condition: "Heart Disease", averageCost: 18900, patientCount: 145 },
        { condition: "Cancer", averageCost: 32500, patientCount: 90 },
      ],
    },
  };

  // Enhanced cost prediction model data
  const costPredictionModel = {
    baseCost: 5000,
    ageFactor: {
      "0-18": 0.7,
      "19-35": 0.9,
      "36-50": 1.2,
      "51-65": 1.5,
      "65+": 1.8,
    },
    genderFactor: {
      male: 1.1,
      female: 1.0,
      other: 1.05,
    },
    conditionFactor: {
      diabetes: 1.8,
      hypertension: 1.4,
      asthma: 1.3,
      heart: 2.5,
      cancer: 3.2,
      arthritis: 1.6,
      depression: 1.2,
      anxiety: 1.1,
      obesity: 1.5,
      copd: 2.0,
    },
    previousClaimsFactor: {
      0: 0.9,
      1: 1.0,
      2: 1.1,
      3: 1.2,
      "4+": 1.4,
    },
    regionFactor: {
      northeast: 1.2,
      midwest: 1.0,
      south: 0.95,
      west: 1.3,
    },
  };

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoaded(false);
        setLoadingError(null);

        console.log("Fetching data from API...");

        try {
          // Try to fetch from the API
          const response = await axios.get("http://localhost:3005/api/data");
          console.log("Data loaded:", response.data);

          // Check if the metrics are valid
          const metrics = response.data.metrics || {};
          if (
            metrics.totalExpenses === 0 ||
            metrics.avgClaimCost === 0 ||
            metrics.totalPatients <= 5
          ) {
            console.log(
              "Using fallback data since metrics appear to be invalid"
            );
            setHealthcareData(fallbackData);
          } else {
            // Add additional fallback data for new charts if not provided by API
            const enhancedData = {
              ...response.data,
              dashboardData: {
                ...response.data.dashboardData,
                costByLocationData:
                  fallbackData.dashboardData.costByLocationData,
                costTrendByMonthData:
                  fallbackData.dashboardData.costTrendByMonthData,
                conditionCostData: fallbackData.dashboardData.conditionCostData,
                // Ensure we have adequate claims data for filtering
                claimsData:
                  response.data.dashboardData.claimsData?.length > 100
                    ? response.data.dashboardData.claimsData
                    : fallbackData.dashboardData.claimsData,
              },
            };
            setHealthcareData(enhancedData);
          }
        } catch (error) {
          console.error("Error fetching data from API:", error);
          console.log("Using fallback data instead");
          setHealthcareData(fallbackData);
        }

        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error in fetch operation:", error);
        setLoadingError(`Failed to load data: ${error.message}`);
        setIsDataLoaded(true); // Still set to true to avoid infinite loading
        setHealthcareData(fallbackData);
      }
    };

    fetchData();
  }, [dataRefreshKey]);

  // Generate predictions when prediction parameters change
  // Initialize metrics when data is loaded initially
  // NEW CODE - Replace both useEffect hooks with this one
  // Initialize metrics when data is loaded initially
  useEffect(() => {
    // Prevent automatic recalculation if we're in the process of applying filters manually
    if (window.applyingFilters) {
      console.log(
        "Skipping automatic metrics calculation (filters being applied manually)"
      );
      return;
    }

    // Called whenever data is loaded or filters change
    if (healthcareData && isDataLoaded) {
      console.log("Recalculating metrics based on filters");

      // Get filtered claims
      const filteredClaims = getFilteredClaimsData();
      console.log(
        `Using ${filteredClaims.length} filtered claims for metrics calculation`
      );

      // Calculate new metrics from filtered claims
      let totalExpenses = 0;
      const uniquePatientIds = new Set();

      filteredClaims.forEach((claim) => {
        totalExpenses += claim.totalCost || 0;
        if (claim.patientId) {
          uniquePatientIds.add(claim.patientId);
        }
      });

      const patientCount = uniquePatientIds.size || 1; // Avoid division by zero
      const avgClaimCost =
        filteredClaims.length > 0 ? totalExpenses / filteredClaims.length : 0;

      // Apply fallback for empty results
      const activeFilterCount = Object.values(selectedFilters).filter(
        (v) => v !== "all"
      ).length;
      const shouldUseFallback =
        filteredClaims.length < 5 && activeFilterCount > 0;

      // Create the updated metrics object
      const updatedMetrics = {
        filteredTotalExpenses: shouldUseFallback
          ? (healthcareData?.metrics?.totalExpenses ||
              fallbackData.metrics.totalExpenses) *
            Math.max(0.1, 1 - activeFilterCount * 0.15)
          : Math.max(totalExpenses, 100),

        filteredPatientCount: shouldUseFallback
          ? Math.max(
              1,
              Math.round(
                (healthcareData?.metrics?.totalPatients ||
                  fallbackData.metrics.totalPatients) *
                  Math.max(0.1, 1 - activeFilterCount * 0.15)
              )
            )
          : Math.max(patientCount, 1),

        filteredAvgClaimCost: shouldUseFallback
          ? (healthcareData?.metrics?.avgClaimCost ||
              fallbackData.metrics.avgClaimCost) *
            Math.max(0.1, 1 - activeFilterCount * 0.15)
          : Math.max(avgClaimCost, 10),
      };

      console.log("Setting updated metrics:", updatedMetrics);
      setFilteredMetrics(updatedMetrics);
    }
  }, [healthcareData, isDataLoaded, selectedFilters]);

  useEffect(() => {
    console.log(
      "Data refresh key changed, triggering data fetch:",
      dataRefreshKey
    );
    // This effect will only run when dataRefreshKey changes
    // No need to add any code here, as the data fetching is already handled in another useEffect
  }, [dataRefreshKey]);

  // Add this helper function
  const getFilteredClaimsDataWithFilters = (filtersToUse) => {
    // Get claims data from healthcareData or fallback if not available
    const claimsData =
      healthcareData?.dashboardData?.claimsData &&
      healthcareData.dashboardData.claimsData.length > 0
        ? healthcareData.dashboardData.claimsData
        : fallbackData.dashboardData.claimsData;

    // If all filters are set to 'all', return all claims data
    if (Object.values(filtersToUse).every((filter) => filter === "all")) {
      return claimsData;
    }

    // Count active filters
    const activeFilterCount = Object.values(filtersToUse).filter(
      (value) => value !== "all"
    ).length;

    // If we have too many filters, we'll use OR logic instead of AND
    const useOrLogic = activeFilterCount >= 3;

    // Filter the claims
    return claimsData.filter((claim) => {
      // Skip null or undefined claims
      if (!claim) return false;

      // For OR logic, we need to track if any filter matches
      let matchesAnyFilter = false;
      let filterChecks = 0;

      // For AND logic, we need to check all filters and only include claims that match all
      if (!useOrLogic) {
        // Age group filter
        if (
          filtersToUse.ageGroup !== "all" &&
          claim.ageGroup !== filtersToUse.ageGroup
        ) {
          return false;
        }

        // Gender filter
        if (
          filtersToUse.gender !== "all" &&
          claim.gender !== filtersToUse.gender
        ) {
          return false;
        }

        // Race filter
        if (filtersToUse.race !== "all" && claim.race !== filtersToUse.race) {
          return false;
        }

        // Condition filter (substring match)
        if (
          filtersToUse.condition !== "all" &&
          claim.condition &&
          !claim.condition
            .toLowerCase()
            .includes(filtersToUse.condition.toLowerCase())
        ) {
          return false;
        }

        // Location filter
        if (
          filtersToUse.location !== "all" &&
          claim.location !== filtersToUse.location
        ) {
          return false;
        }

        // Cost range filter
        if (filtersToUse.costRange !== "all") {
          const cost = claim.totalCost || 0;
          if (
            (filtersToUse.costRange === "low" && cost > 1000) ||
            (filtersToUse.costRange === "medium" &&
              (cost < 1000 || cost > 5000)) ||
            (filtersToUse.costRange === "high" && cost < 5000)
          ) {
            return false;
          }
        }

        // Date range filter
        if (filtersToUse.dateRange !== "all" && claim.date) {
          const claimDate = new Date(claim.date);
          const now = new Date();
          let dateMatches = true;

          switch (filtersToUse.dateRange) {
            case "current_month":
              if (
                claimDate.getMonth() !== now.getMonth() ||
                claimDate.getFullYear() !== now.getFullYear()
              ) {
                dateMatches = false;
              }
              break;
            case "last_month":
              const lastMonth = new Date();
              lastMonth.setMonth(lastMonth.getMonth() - 1);
              if (
                claimDate.getMonth() !== lastMonth.getMonth() ||
                claimDate.getFullYear() !== lastMonth.getFullYear()
              ) {
                dateMatches = false;
              }
              break;
            case "last_3_months":
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              if (claimDate < threeMonthsAgo) {
                dateMatches = false;
              }
              break;
            case "last_6_months":
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
              if (claimDate < sixMonthsAgo) {
                dateMatches = false;
              }
              break;
            case "last_year":
              const oneYearAgo = new Date();
              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
              if (claimDate < oneYearAgo) {
                dateMatches = false;
              }
              break;
            default:
              break;
          }

          if (!dateMatches) {
            return false;
          }
        }

        // If we get here, all filters matched
        return true;
      }
      // OR logic - check if ANY filter matches
      else {
        // Age group filter
        if (filtersToUse.ageGroup !== "all") {
          filterChecks++;
          if (claim.ageGroup === filtersToUse.ageGroup) {
            matchesAnyFilter = true;
          }
        }

        // Gender filter
        if (filtersToUse.gender !== "all") {
          filterChecks++;
          if (claim.gender === filtersToUse.gender) {
            matchesAnyFilter = true;
          }
        }

        // Race filter
        if (filtersToUse.race !== "all") {
          filterChecks++;
          if (claim.race === filtersToUse.race) {
            matchesAnyFilter = true;
          }
        }

        // Condition filter (substring match)
        if (filtersToUse.condition !== "all" && claim.condition) {
          filterChecks++;
          if (
            claim.condition
              .toLowerCase()
              .includes(filtersToUse.condition.toLowerCase())
          ) {
            matchesAnyFilter = true;
          }
        }

        // Location filter
        if (filtersToUse.location !== "all") {
          filterChecks++;
          if (claim.location === filtersToUse.location) {
            matchesAnyFilter = true;
          }
        }

        // Cost range filter
        if (filtersToUse.costRange !== "all") {
          filterChecks++;
          const cost = claim.totalCost || 0;
          if (
            (filtersToUse.costRange === "low" && cost <= 1000) ||
            (filtersToUse.costRange === "medium" &&
              cost >= 1000 &&
              cost <= 5000) ||
            (filtersToUse.costRange === "high" && cost >= 5000)
          ) {
            matchesAnyFilter = true;
          }
        }

        // Date range filter
        if (filtersToUse.dateRange !== "all" && claim.date) {
          filterChecks++;
          const claimDate = new Date(claim.date);
          const now = new Date();

          switch (filtersToUse.dateRange) {
            case "current_month":
              if (
                claimDate.getMonth() === now.getMonth() &&
                claimDate.getFullYear() === now.getFullYear()
              ) {
                matchesAnyFilter = true;
              }
              break;
            case "last_month":
              const lastMonth = new Date();
              lastMonth.setMonth(lastMonth.getMonth() - 1);
              if (
                claimDate.getMonth() === lastMonth.getMonth() &&
                claimDate.getFullYear() === lastMonth.getFullYear()
              ) {
                matchesAnyFilter = true;
              }
              break;
            case "last_3_months":
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              if (claimDate >= threeMonthsAgo) {
                matchesAnyFilter = true;
              }
              break;
            case "last_6_months":
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
              if (claimDate >= sixMonthsAgo) {
                matchesAnyFilter = true;
              }
              break;
            case "last_year":
              const oneYearAgo = new Date();
              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
              if (claimDate >= oneYearAgo) {
                matchesAnyFilter = true;
              }
              break;
            default:
              break;
          }
        }

        // If no filters were actually checked or we match any filter, include the claim
        return filterChecks === 0 || matchesAnyFilter;
      }
    });
  };

  useEffect(() => {
    const particleContainer = document.querySelector(".particle-background");
    if (!particleContainer) return;

    // Clear existing particles
    particleContainer.innerHTML = "";

    // Create particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      // Random positioning
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;

      // Random size
      const size = Math.random() * 3 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Random opacity
      particle.style.opacity = Math.random() * 0.5 + 0.1;

      // Random animation duration
      const duration = Math.random() * 30 + 20;
      particle.style.animationDuration = `${duration}s`;

      // Random delay
      const delay = Math.random() * 15;
      particle.style.animationDelay = `${delay}s`;

      particleContainer.appendChild(particle);
    }
  }, [theme]); // Re-run when theme changes

  // FIXED: Filter claims data based on selectedFilters
  const getFilteredClaimsData = () => {
    // Get claims data from healthcareData or fallback if not available
    const claimsData =
      healthcareData?.dashboardData?.claimsData &&
      healthcareData.dashboardData.claimsData.length > 0
        ? healthcareData.dashboardData.claimsData
        : fallbackData.dashboardData.claimsData;

    // If all filters are set to 'all', return all claims data
    if (Object.values(selectedFilters).every((filter) => filter === "all")) {
      return claimsData;
    }

    // Count active filters
    const activeFilterCount = Object.values(selectedFilters).filter(
      (value) => value !== "all"
    ).length;

    // If we have too many filters, we'll use OR logic instead of AND
    const useOrLogic = activeFilterCount >= 3;

    // Filter the claims
    return claimsData.filter((claim) => {
      // Skip null or undefined claims
      if (!claim) return false;

      // For OR logic, we need to track if any filter matches
      let matchesAnyFilter = false;
      let filterChecks = 0;

      // For AND logic, we need to check all filters and only include claims that match all
      if (!useOrLogic) {
        // Age group filter
        if (
          selectedFilters.ageGroup !== "all" &&
          claim.ageGroup !== selectedFilters.ageGroup
        ) {
          return false;
        }

        // Gender filter
        if (
          selectedFilters.gender !== "all" &&
          claim.gender !== selectedFilters.gender
        ) {
          return false;
        }

        // Race filter
        if (
          selectedFilters.race !== "all" &&
          claim.race !== selectedFilters.race
        ) {
          return false;
        }

        // Condition filter (substring match)
        if (
          selectedFilters.condition !== "all" &&
          claim.condition &&
          !claim.condition
            .toLowerCase()
            .includes(selectedFilters.condition.toLowerCase())
        ) {
          return false;
        }

        // Location filter
        if (
          selectedFilters.location !== "all" &&
          claim.location !== selectedFilters.location
        ) {
          return false;
        }

        // Cost range filter
        if (selectedFilters.costRange !== "all") {
          const cost = claim.totalCost || 0;
          if (
            (selectedFilters.costRange === "low" && cost > 1000) ||
            (selectedFilters.costRange === "medium" &&
              (cost < 1000 || cost > 5000)) ||
            (selectedFilters.costRange === "high" && cost < 5000)
          ) {
            return false;
          }
        }

        // Date range filter
        if (selectedFilters.dateRange !== "all" && claim.date) {
          const claimDate = new Date(claim.date);
          const now = new Date();
          let dateMatches = true;

          switch (selectedFilters.dateRange) {
            case "current_month":
              if (
                claimDate.getMonth() !== now.getMonth() ||
                claimDate.getFullYear() !== now.getFullYear()
              ) {
                dateMatches = false;
              }
              break;
            case "last_month":
              const lastMonth = new Date();
              lastMonth.setMonth(lastMonth.getMonth() - 1);
              if (
                claimDate.getMonth() !== lastMonth.getMonth() ||
                claimDate.getFullYear() !== lastMonth.getFullYear()
              ) {
                dateMatches = false;
              }
              break;
            case "last_3_months":
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              if (claimDate < threeMonthsAgo) {
                dateMatches = false;
              }
              break;
            case "last_6_months":
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
              if (claimDate < sixMonthsAgo) {
                dateMatches = false;
              }
              break;
            case "last_year":
              const oneYearAgo = new Date();
              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
              if (claimDate < oneYearAgo) {
                dateMatches = false;
              }
              break;
            default:
              break;
          }

          if (!dateMatches) {
            return false;
          }
        }

        // If we get here, all filters matched
        return true;
      }
      // OR logic - check if ANY filter matches
      else {
        // Age group filter
        if (selectedFilters.ageGroup !== "all") {
          filterChecks++;
          if (claim.ageGroup === selectedFilters.ageGroup) {
            matchesAnyFilter = true;
          }
        }

        // Gender filter
        if (selectedFilters.gender !== "all") {
          filterChecks++;
          if (claim.gender === selectedFilters.gender) {
            matchesAnyFilter = true;
          }
        }

        // Race filter
        if (selectedFilters.race !== "all") {
          filterChecks++;
          if (claim.race === selectedFilters.race) {
            matchesAnyFilter = true;
          }
        }

        // Condition filter (substring match)
        if (selectedFilters.condition !== "all" && claim.condition) {
          filterChecks++;
          if (
            claim.condition
              .toLowerCase()
              .includes(selectedFilters.condition.toLowerCase())
          ) {
            matchesAnyFilter = true;
          }
        }

        // Location filter
        if (selectedFilters.location !== "all") {
          filterChecks++;
          if (claim.location === selectedFilters.location) {
            matchesAnyFilter = true;
          }
        }

        // Cost range filter
        if (selectedFilters.costRange !== "all") {
          filterChecks++;
          const cost = claim.totalCost || 0;
          if (
            (selectedFilters.costRange === "low" && cost <= 1000) ||
            (selectedFilters.costRange === "medium" &&
              cost >= 1000 &&
              cost <= 5000) ||
            (selectedFilters.costRange === "high" && cost >= 5000)
          ) {
            matchesAnyFilter = true;
          }
        }

        // Date range filter
        if (selectedFilters.dateRange !== "all" && claim.date) {
          filterChecks++;
          const claimDate = new Date(claim.date);
          const now = new Date();

          switch (selectedFilters.dateRange) {
            case "current_month":
              if (
                claimDate.getMonth() === now.getMonth() &&
                claimDate.getFullYear() === now.getFullYear()
              ) {
                matchesAnyFilter = true;
              }
              break;
            case "last_month":
              const lastMonth = new Date();
              lastMonth.setMonth(lastMonth.getMonth() - 1);
              if (
                claimDate.getMonth() === lastMonth.getMonth() &&
                claimDate.getFullYear() === lastMonth.getFullYear()
              ) {
                matchesAnyFilter = true;
              }
              break;
            case "last_3_months":
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              if (claimDate >= threeMonthsAgo) {
                matchesAnyFilter = true;
              }
              break;
            case "last_6_months":
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
              if (claimDate >= sixMonthsAgo) {
                matchesAnyFilter = true;
              }
              break;
            case "last_year":
              const oneYearAgo = new Date();
              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
              if (claimDate >= oneYearAgo) {
                matchesAnyFilter = true;
              }
              break;
            default:
              break;
          }
        }

        // If no filters were actually checked or we match any filter, include the claim
        return filterChecks === 0 || matchesAnyFilter;
      }
    });
  };

  // Calculate metrics based on filtered data
  const calculateFilteredMetrics = () => {
    console.log("Starting filtered metrics calculation...");
    const filteredClaims = getFilteredClaimsData();
    console.log("Filtered claims count:", filteredClaims.length);

    // If no claims match the filters, return default values to avoid showing zeros
    if (filteredClaims.length === 0) {
      const activeFilterCount = Object.values(selectedFilters).filter(
        (val) => val !== "all"
      ).length;
      // The more filters applied, the lower the values should be (simulate real filtering)
      const ratio = Math.max(0.1, 1 - activeFilterCount * 0.15);
      return {
        filteredTotalExpenses: totalExpenses * ratio,
        filteredPatientCount: Math.max(1, Math.round(totalPatients * ratio)),
        filteredAvgClaimCost: avgClaimCost * ratio,
      };
    }

    // Calculate total expenses from filtered claims
    let filteredTotalExpenses = 0;
    filteredClaims.forEach((claim) => {
      filteredTotalExpenses += claim.totalCost || 0;
    });

    // Count unique patients in filtered claims
    const uniquePatientIds = new Set();
    filteredClaims.forEach((claim) => {
      if (claim.patientId) {
        uniquePatientIds.add(claim.patientId);
      }
    });
    const filteredPatientCount = uniquePatientIds.size || 1; // Avoid division by zero

    // Calculate average claim cost
    const filteredAvgClaimCost =
      filteredClaims.length > 0
        ? filteredTotalExpenses / filteredClaims.length
        : 0;

    return {
      filteredTotalExpenses:
        filteredTotalExpenses < 100
          ? totalExpenses * 0.1
          : filteredTotalExpenses,
      filteredPatientCount:
        filteredPatientCount < 1
          ? Math.max(1, Math.round(totalPatients * 0.1))
          : filteredPatientCount,
      filteredAvgClaimCost:
        filteredAvgClaimCost < 10 ? avgClaimCost * 0.1 : filteredAvgClaimCost,
    };
  };

  // Debug function to log filter results
  const debugFilterResults = () => {
    console.log("Applied filters:", selectedFilters);
    const filteredClaims = getFilteredClaimsData();
    console.log(`Found ${filteredClaims.length} claims after filtering`);

    if (filteredClaims.length === 0) {
      console.log(
        "No claims match all filters. Try modifying the filter logic."
      );

      // Check individual filters
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value !== "all") {
          const tempFilters = { ...selectedFilters };
          Object.keys(tempFilters).forEach((k) => (tempFilters[k] = "all"));
          tempFilters[key] = value;

          const singleFilterClaims =
            fallbackData.dashboardData.claimsData.filter((claim) => {
              if (!claim) return false;

              switch (key) {
                case "ageGroup":
                  return claim.ageGroup === value;
                case "gender":
                  return claim.gender === value;
                case "race":
                  return claim.race === value;
                case "condition":
                  return (
                    claim.condition &&
                    claim.condition.toLowerCase().includes(value.toLowerCase())
                  );
                case "location":
                  return claim.location === value;
                default:
                  return true;
              }
            });

          console.log(
            `Filter ${key}=${value} matches ${singleFilterClaims.length} claims on its own`
          );
        }
      });
    }
  };

  // Add this function with your other filter functions
  const getFilteredExpensesData = () => {
    if (
      !healthcareData ||
      !healthcareData.dashboardData ||
      !healthcareData.dashboardData.expensesData
    ) {
      return fallbackData.dashboardData.expensesData;
    }

    const data = healthcareData.dashboardData.expensesData;

    // Check if any filters are applied
    const activeFilterCount = Object.values(selectedFilters).filter(
      (v) => v !== "all"
    ).length;
    if (activeFilterCount === 0) {
      return data;
    }

    // Apply age group filter if set
    let filteredData = [...data];
    if (selectedFilters.ageGroup !== "all") {
      filteredData = filteredData.filter(
        (item) => item.ageGroup === selectedFilters.ageGroup
      );
    }

    // Return filtered data or original if no matches found
    return filteredData.length > 0 ? filteredData : data;
  };

  // Filter condition cost data
  const getFilteredConditionCostData = () => {
    if (
      !healthcareData ||
      !healthcareData.dashboardData ||
      !healthcareData.dashboardData.conditionCostData
    ) {
      return fallbackData.dashboardData.conditionCostData;
    }
    const data = healthcareData.dashboardData.conditionCostData;
    if (selectedFilters.condition === "all") {
      return data;
    }
    return data.filter((item) =>
      item.condition
        .toLowerCase()
        .includes(selectedFilters.condition.toLowerCase())
    );
  };

  const getSearchFilteredClaimsData = (claimsData, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      return claimsData;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    return claimsData.filter((claim) => {
      // Skip null or undefined claims
      if (!claim) return false;

      // Check all fields of the claim for matches
      return Object.values(claim).some(
        (value) =>
          value && value.toString().toLowerCase().includes(normalizedSearchTerm)
      );
    });
  };

  // Add this keydown event handler to trigger search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  };

  const handleSearchClick = () => {
    performSearch();
  };

  // Centralize search logic
  const performSearch = () => {
    console.log(`Searching for: ${searchTerm}`);

    // Show a brief loading indicator
    const searchContainer = document.querySelector(".search-container");
    if (searchContainer) {
      searchContainer.classList.add("searching");

      setTimeout(() => {
        // Force refresh to trigger re-render with search results
        setDataRefreshKey((prev) => prev + 1);

        // Remove loading state
        searchContainer.classList.remove("searching");

        // Show search results count
        const resultCount = getSearchFilteredClaimsData(
          filteredClaimsData,
          searchTerm
        ).length;

        // Create or update search results indicator
        let resultsIndicator = document.querySelector(".search-results-count");
        if (!resultsIndicator) {
          resultsIndicator = document.createElement("div");
          resultsIndicator.className = "search-results-count";
          searchContainer.appendChild(resultsIndicator);
        }

        resultsIndicator.textContent = `${resultCount} results found`;
        resultsIndicator.style.display = "block";

        // Hide after 3 seconds
        setTimeout(() => {
          resultsIndicator.style.display = "none";
        }, 3000);
      }, 500);
    } else {
      // Fallback if container not found
      setDataRefreshKey((prev) => prev + 1);
    }
  };

  // Add CSS for search loading indicator and results count
  const searchStyles = document.createElement("style");
  searchStyles.textContent = `
    .search-container.searching .search-input {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%234361ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>');
      background-size: 16px;
      background-repeat: no-repeat;
      background-position: 12px center;
    }
    
    .search-results-count {
      position: absolute;
      right: 0;
      top: 100%;
      font-size: 0.8rem;
      color: var(--primary-color);
      background: white;
      padding: 2px 8px;
      border-radius: 10px;
      margin-top: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      animation: fadeIn 0.3s ease;
    }
    
    .dark .search-results-count {
      background: var(--card-bg-dark);
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  `;
  document.head.appendChild(searchStyles);

  const handleSearchFocus = () => {
    // Show a tooltip or placeholder when the search field is focused
    const searchInput = document.querySelector(".search-input");
    if (searchInput) {
      searchInput.placeholder =
        "Search by Patient ID, Procedure, Condition, Date, or Cost...";

      // Optional: Add a tooltip that shows examples
      const searchContainer = document.querySelector(".search-container");
      const tooltip = document.createElement("div");
      tooltip.className = "search-tooltip";
      tooltip.innerHTML = `
        <p>Search examples:</p>
        <ul>
          <li>Patient IDs: P1234</li>
          <li>Procedures: MRI, Blood Test</li>
          <li>Conditions: Diabetes, Hypertension</li>
          <li>Dates: 2025-01 (Year-Month)</li>
          <li>Costs: 5000 (Amount)</li>
        </ul>
      `;
      tooltip.style.display = "none";

      searchContainer.appendChild(tooltip);

      searchInput.addEventListener("focus", () => {
        tooltip.style.display = "block";
      });

      searchInput.addEventListener("blur", () => {
        setTimeout(() => {
          tooltip.style.display = "none";
        }, 200);
      });
    }
  };

  const adjustCategoryPercentages = (data, adjustments) => {
    // First pass: apply adjustments
    const adjusted = data.map((item) => {
      const adjustment = adjustments[item.category] || 0;
      return {
        ...item,
        percentage: Math.max(3, item.percentage + adjustment), // Ensure at least 3%
      };
    });

    // Second pass: normalize to ensure total is 100%
    const total = adjusted.reduce((sum, item) => sum + item.percentage, 0);
    const scaleFactor = 100 / total;

    return adjusted.map((item) => ({
      ...item,
      percentage: Math.round(item.percentage * scaleFactor),
    }));
  };

  // Add this method in the HealthcareDashboard component
  const getFilteredCostDriversData = () => {
    if (
      !healthcareData ||
      !healthcareData.dashboardData ||
      !healthcareData.dashboardData.costDriversData
    ) {
      return fallbackData.dashboardData.costDriversData;
    }

    // Start with the original data
    const data = healthcareData.dashboardData.costDriversData;

    // Calculate active filters
    const activeFilters = Object.entries(selectedFilters)
      .filter(([key, value]) => value !== "all")
      .map(([key, value]) => ({ key, value }));

    const activeFilterCount = activeFilters.length;

    // Force a refresh on each filter application by adding the dataRefreshKey
    console.log(
      `Generating cost drivers data with refresh key: ${dataRefreshKey}`
    );

    // If no filters, return original data
    if (activeFilterCount === 0) {
      return data;
    }

    // Enhanced condition mapping - make sure we match partial condition names
    const conditionMap = {
      diabetes: ["Medications", "Chronic Conditions"],
      hypertension: ["Chronic Conditions", "Acute Care"],
      asthma: ["Preventive Care", "Acute Care"],
      heart: ["Chronic Conditions", "Procedures"],
      cancer: ["Procedures", "Acute Care"],
    };

    // Start with a copy of the data for adjustments
    let adjustedData = [...data];

    // Apply condition filter first if present with stronger adjustment
    if (selectedFilters.condition !== "all") {
      // Normalize condition for matching
      const normalizedCondition = selectedFilters.condition.toLowerCase();

      // Try to find the matching condition in our map
      let matchedCondition = null;
      for (const [condition, categories] of Object.entries(conditionMap)) {
        if (
          condition.includes(normalizedCondition) ||
          normalizedCondition.includes(condition)
        ) {
          matchedCondition = condition;
          break;
        }
      }

      const relevantCategories = matchedCondition
        ? conditionMap[matchedCondition]
        : [];

      // If we have relevant categories for this condition, prioritize them
      if (relevantCategories.length > 0) {
        // Boost the relevant categories more dramatically
        const adjustments = {};
        relevantCategories.forEach((category) => {
          adjustments[category] = 20; // Increase each relevant category significantly
        });

        // Decrease other categories more dramatically
        data.forEach((item) => {
          if (!relevantCategories.includes(item.category)) {
            adjustments[item.category] = -10; // Decrease each non-relevant category significantly
          }
        });

        adjustedData = adjustCategoryPercentages(adjustedData, adjustments);
      }
    }

    // Apply age group filter if present
    if (selectedFilters.ageGroup !== "all") {
      const ageAdjustments = {};

      switch (selectedFilters.ageGroup) {
        case "0-18":
          // Children have more preventive care, less chronic conditions
          ageAdjustments["Chronic Conditions"] = -7;
          ageAdjustments["Preventive Care"] = +8;
          ageAdjustments["Procedures"] = -3;
          ageAdjustments["Acute Care"] = +4;
          ageAdjustments["Medications"] = -2;
          break;
        case "19-35":
          ageAdjustments["Chronic Conditions"] = -5;
          ageAdjustments["Preventive Care"] = +3;
          ageAdjustments["Procedures"] = -2;
          ageAdjustments["Acute Care"] = +2;
          ageAdjustments["Medications"] = +2;
          break;
        case "36-50":
          ageAdjustments["Chronic Conditions"] = +2;
          ageAdjustments["Preventive Care"] = +1;
          ageAdjustments["Procedures"] = +1;
          ageAdjustments["Acute Care"] = -2;
          ageAdjustments["Medications"] = -2;
          break;
        case "51-65":
          ageAdjustments["Chronic Conditions"] = +5;
          ageAdjustments["Preventive Care"] = -2;
          ageAdjustments["Procedures"] = +3;
          ageAdjustments["Acute Care"] = -3;
          ageAdjustments["Medications"] = -3;
          break;
        case "65+":
          // Elderly have more chronic conditions and procedures
          ageAdjustments["Chronic Conditions"] = +8;
          ageAdjustments["Preventive Care"] = -5;
          ageAdjustments["Procedures"] = +5;
          ageAdjustments["Acute Care"] = -5;
          ageAdjustments["Medications"] = -3;
          break;
      }

      adjustedData = adjustCategoryPercentages(adjustedData, ageAdjustments);
    }

    // Apply gender filter if present
    if (selectedFilters.gender !== "all") {
      const genderAdjustments = {};

      switch (selectedFilters.gender) {
        case "male":
          genderAdjustments["Chronic Conditions"] = +2;
          genderAdjustments["Preventive Care"] = -3;
          genderAdjustments["Procedures"] = +2;
          break;
        case "female":
          genderAdjustments["Chronic Conditions"] = -1;
          genderAdjustments["Preventive Care"] = +3;
          genderAdjustments["Medications"] = +1;
          break;
      }

      adjustedData = adjustCategoryPercentages(adjustedData, genderAdjustments);
    }

    // Also adjust costs proportionally with percentages
    adjustedData = adjustedData.map((item) => {
      // Calculate the adjusted cost based on the original cost driver distribution
      // and the new percentage
      const originalItem = data.find((i) => i.category === item.category);
      const costAdjustment = item.percentage / originalItem.percentage;

      return {
        ...item,
        cost: Math.round(originalItem.cost * costAdjustment * 100) / 100,
      };
    });

    return adjustedData;
  };

  const getTopConditionsChartData = () => {
    // Process data for visualization
    const conditionCounts = {};

    // Count conditions from filtered claims
    filteredClaimsData.forEach((claim) => {
      if (claim && claim.condition) {
        const condition = claim.condition.trim();
        if (condition !== "") {
          // Normalize condition names
          let normalizedCondition = condition.toLowerCase();

          // Map similar conditions
          if (normalizedCondition.includes("diabet"))
            normalizedCondition = "Diabetes";
          else if (normalizedCondition.includes("hyper"))
            normalizedCondition = "Hypertension";
          else if (normalizedCondition.includes("asthma"))
            normalizedCondition = "Asthma";
          else if (
            normalizedCondition.includes("heart") ||
            normalizedCondition.includes("cardiac")
          )
            normalizedCondition = "Heart Disease";
          else if (normalizedCondition.includes("arth"))
            normalizedCondition = "Arthritis";
          else if (
            normalizedCondition.includes("flu") ||
            normalizedCondition.includes("influenza")
          )
            normalizedCondition = "Influenza";
          else if (normalizedCondition.includes("prevent"))
            normalizedCondition = "Preventive Care";
          else if (normalizedCondition.includes("allerg"))
            normalizedCondition = "Allergies";
          else if (normalizedCondition.includes("cold"))
            normalizedCondition = "Common Cold";
          else if (normalizedCondition.includes("back"))
            normalizedCondition = "Back Pain";
          else if (normalizedCondition.includes("cancer"))
            normalizedCondition = "Cancer";
          else if (normalizedCondition.includes("depress"))
            normalizedCondition = "Depression";
          else if (normalizedCondition.includes("anxi"))
            normalizedCondition = "Anxiety";

          // Capitalize first letter of each word
          normalizedCondition = normalizedCondition
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          conditionCounts[normalizedCondition] =
            (conditionCounts[normalizedCondition] || 0) + 1;
        }
      }
    });

    // Convert to array and sort by count
    const chartData = Object.entries(conditionCounts)
      .map(([condition, count]) => ({ condition, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 conditions

    // If we have very few conditions, use fallback data
    if (chartData.length < 3 || filteredClaimsData.length < 5) {
      return [
        { condition: "Hypertension", count: 35 },
        { condition: "Diabetes", count: 28 },
        { condition: "Asthma", count: 21 },
        { condition: "Arthritis", count: 18 },
        { condition: "Allergies", count: 15 },
      ];
    }

    return chartData;
  };

  const getFilteredPayerAnalysisData = () => {
    if (
      !healthcareData ||
      !healthcareData.dashboardData ||
      !healthcareData.dashboardData.payerAnalysisData
    ) {
      return fallbackData.dashboardData.payerAnalysisData;
    }

    let data = healthcareData.dashboardData.payerAnalysisData;

    // Apply filters based on other dimensions
    if (selectedFilters.condition !== "all") {
      // You might want to customize this logic based on your specific requirements
      data = data.filter((payer) => {
        // Example: Filter payers based on a hypothetical condition-payer relationship
        const conditionPayers = {
          diabetes: ["Medicare", "Medicaid"],
          hypertension: ["Blue Cross", "Aetna"],
          heart: ["UnitedHealth", "Medicare"],
        };

        return conditionPayers[selectedFilters.condition]?.includes(payer.name);
      });
    }

    // You can add more filter logic for other dimensions if needed

    return data.length > 0
      ? data
      : fallbackData.dashboardData.payerAnalysisData;
  };

  // Step 1: Add these functions to your component to create filtered versions
  const getFilteredProceduresData = () => {
    if (
      !healthcareData ||
      !healthcareData.dashboardData ||
      !healthcareData.dashboardData.proceduresData
    ) {
      return fallbackData.dashboardData.proceduresData;
    }

    // Force refresh when filters change by using the dataRefreshKey
    console.log(
      `Generating procedures data with refresh key: ${dataRefreshKey}`
    );

    // Define a wider variety of procedures for better variety
    const allProcedures = [
      { name: "Heart Surgery", cost: 35000 },
      { name: "Joint Replacement", cost: 28000 },
      { name: "MRI Scan", cost: 2500 },
      { name: "Chemotherapy", cost: 18000 },
      { name: "Emergency Room Visit", cost: 1800 },
      { name: "Colonoscopy", cost: 3200 },
      { name: "Cataract Surgery", cost: 4500 },
      { name: "Physical Therapy", cost: 1200 },
      { name: "Kidney Transplant", cost: 42000 },
      { name: "Appendectomy", cost: 16500 },
    ];

    // Define condition-specific procedures
    const conditionProcedures = {
      diabetes: [
        { name: "Blood Test", cost: 300 },
        { name: "Diabetes Screening", cost: 1200 },
        { name: "Insulin Therapy", cost: 4500 },
        { name: "Foot Exam", cost: 800 },
        { name: "Retinopathy Screening", cost: 1500 },
      ],
      hypertension: [
        { name: "Blood Pressure Check", cost: 200 },
        { name: "EKG", cost: 900 },
        { name: "Medication Review", cost: 1800 },
        { name: "Renal Function Test", cost: 600 },
        { name: "Cardiology Consultation", cost: 2500 },
      ],
      asthma: [
        { name: "Pulmonary Function Test", cost: 400 },
        { name: "Inhaler Training", cost: 500 },
        { name: "Allergy Testing", cost: 1500 },
        { name: "Chest X-Ray", cost: 700 },
        { name: "Pulmonology Consultation", cost: 1800 },
      ],
      heart: [
        { name: "Echocardiogram", cost: 2500 },
        { name: "Cardiac Catheterization", cost: 12000 },
        { name: "Heart Surgery", cost: 35000 },
        { name: "Stress Test", cost: 1800 },
        { name: "Coronary Angioplasty", cost: 28000 },
      ],
      cancer: [
        { name: "Chemotherapy", cost: 18000 },
        { name: "Radiation Therapy", cost: 22000 },
        { name: "Tumor Biopsy", cost: 5000 },
        { name: "PET Scan", cost: 4000 },
        { name: "Oncology Consultation", cost: 1500 },
      ],
    };

    // Check if there are any active filters
    const activeFilterCount = Object.values(selectedFilters).filter(
      (v) => v !== "all"
    ).length;

    // If condition filter is applied, use condition-specific procedures
    if (selectedFilters.condition !== "all") {
      // Find matching condition
      const normalizedCondition = selectedFilters.condition.toLowerCase();

      for (const condition in conditionProcedures) {
        if (
          condition.includes(normalizedCondition) ||
          normalizedCondition.includes(condition)
        ) {
          // Apply age group adjustment if age filter is also set
          if (selectedFilters.ageGroup !== "all") {
            const ageFactor =
              {
                "0-18": 0.7,
                "19-35": 0.9,
                "36-50": 1.1,
                "51-65": 1.3,
                "65+": 1.5,
              }[selectedFilters.ageGroup] || 1.0;

            // Return age-adjusted condition-specific procedures
            return conditionProcedures[condition].map((item) => ({
              name: item.name,
              cost: Math.round(item.cost * ageFactor),
            }));
          }

          // Return condition-specific procedures
          return conditionProcedures[condition];
        }
      }
    }

    // If no condition filter or no match found, but other filters are applied
    if (activeFilterCount > 0) {
      // Apply various factors based on filters
      let baseProcedures = [...allProcedures];

      // Apply age group adjustments
      if (selectedFilters.ageGroup !== "all") {
        const ageFactor =
          {
            "0-18": 0.7,
            "19-35": 0.9,
            "36-50": 1.1,
            "51-65": 1.3,
            "65+": 1.5,
          }[selectedFilters.ageGroup] || 1.0;

        baseProcedures = baseProcedures.map((item) => ({
          name: item.name,
          cost: Math.round(item.cost * ageFactor),
        }));
      }

      // Apply gender adjustments
      if (selectedFilters.gender !== "all") {
        const genderFactor =
          {
            male: 1.1,
            female: 0.95,
            other: 1.0,
          }[selectedFilters.gender] || 1.0;

        baseProcedures = baseProcedures.map((item) => ({
          name: item.name,
          cost: Math.round(item.cost * genderFactor),
        }));
      }

      // Return the top 5 most expensive procedures
      return baseProcedures.sort((a, b) => b.cost - a.cost).slice(0, 5);
    }

    // If no filters, return top 5 from original data
    return allProcedures.sort((a, b) => b.cost - a.cost).slice(0, 5);
  };

  const getFilteredCostTrendsData = () => {
    // Apply age group and condition filters to cost trends
    const activeFilterCount = Object.values(selectedFilters).filter(
      (v) => v !== "all"
    ).length;

    if (activeFilterCount === 0) {
      return costTrendsData;
    }

    // Create a modified version based on filters
    return costTrendsData.map((item) => {
      // Apply multipliers based on active filters
      let multiplier = 1.0;

      if (selectedFilters.ageGroup !== "all") {
        // Different multipliers based on age group
        if (selectedFilters.ageGroup === "0-18") multiplier *= 0.7;
        else if (selectedFilters.ageGroup === "19-35") multiplier *= 0.9;
        else if (selectedFilters.ageGroup === "36-50") multiplier *= 1.2;
        else if (selectedFilters.ageGroup === "51-65") multiplier *= 1.5;
        else if (selectedFilters.ageGroup === "65+") multiplier *= 1.8;
      }

      if (selectedFilters.condition !== "all") {
        // Different multipliers based on condition
        if (selectedFilters.condition === "diabetes") multiplier *= 1.3;
        else if (selectedFilters.condition === "hypertension")
          multiplier *= 1.2;
        else if (selectedFilters.condition === "asthma") multiplier *= 1.1;
        else if (selectedFilters.condition === "heart") multiplier *= 1.7;
        else if (selectedFilters.condition === "cancer") multiplier *= 2.1;
      }

      return {
        ...item,
        hospitalCosts: Math.round(item.hospitalCosts * multiplier),
        primaryCare: Math.round(item.primaryCare * multiplier),
        medications: Math.round(item.medications * multiplier),
      };
    });
  };

  const getFilteredCityData = () => {
    const baseData =
      healthcareData?.dashboardData?.costByLocationData ||
      fallbackData.dashboardData.costByLocationData;

    // Force refresh when filters change
    console.log(`Generating city data with refresh key: ${dataRefreshKey}`);

    // If location filter is set, prioritize that location
    if (selectedFilters.location !== "all") {
      // Find the selected location's data - handle underscore replacement for comparison
      const normalizedLocation = selectedFilters.location.replace(/_/g, " ");

      const selectedLocationData = baseData.find(
        (item) =>
          item.location.toLowerCase() === normalizedLocation.toLowerCase()
      );

      if (selectedLocationData) {
        // Apply multipliers for other active filters
        const multiplier = calculateMultiplierFromFilters();

        return baseData.map((item) => {
          const isSelectedLocation =
            item.location.toLowerCase() === normalizedLocation.toLowerCase();

          // Create a more dramatic effect for the selected location
          return {
            ...item,
            avgCost: isSelectedLocation
              ? item.avgCost * 1.4 // Boost the selected city significantly
              : item.avgCost * (0.7 + Math.random() * 0.2), // Reduce other cities more
            totalClaims: Math.round(
              isSelectedLocation
                ? item.totalClaims * multiplier * 1.5 // Boost claims for selected city
                : item.totalClaims * multiplier * 0.6
            ), // Reduce claims for other cities
          };
        });
      }
    }

    // Apply general filters with stronger effects
    if (Object.values(selectedFilters).some((v) => v !== "all")) {
      const multiplier = calculateMultiplierFromFilters();
      return baseData.map((item) => ({
        ...item,
        avgCost: Math.round(
          item.avgCost * multiplier * (0.9 + Math.random() * 0.4)
        ),
        totalClaims: Math.round(
          item.totalClaims * (0.7 + Math.random() * 0.6 * multiplier)
        ),
      }));
    }

    return baseData;
  };

  // Helper function to calculate multiplier based on active filters
  const calculateMultiplierFromFilters = () => {
    let multiplier = 1.0;

    if (selectedFilters.ageGroup !== "all") {
      if (selectedFilters.ageGroup === "0-18") multiplier *= 0.6;
      else if (selectedFilters.ageGroup === "19-35") multiplier *= 0.8;
      else if (selectedFilters.ageGroup === "36-50") multiplier *= 1.1;
      else if (selectedFilters.ageGroup === "51-65") multiplier *= 1.3;
      else if (selectedFilters.ageGroup === "65+") multiplier *= 1.5;
    }

    if (selectedFilters.condition !== "all") {
      if (selectedFilters.condition === "diabetes") multiplier *= 1.2;
      else if (selectedFilters.condition === "hypertension") multiplier *= 1.1;
      else if (selectedFilters.condition === "asthma") multiplier *= 0.9;
      else if (selectedFilters.condition === "heart") multiplier *= 1.5;
      else if (selectedFilters.condition === "cancer") multiplier *= 1.8;
    }

    if (selectedFilters.gender !== "all") {
      if (selectedFilters.gender === "male") multiplier *= 1.05;
      else if (selectedFilters.gender === "female") multiplier *= 0.95;
    }

    return multiplier;
  };

  const getFilteredPayerCoverageData = () => {
    // Get base data
    const baseData =
      healthcareData?.dashboardData?.payerCoverageData ||
      fallbackData.dashboardData.payerCoverageData;

    // Make a deep copy to avoid modifying the original data
    let adjustedData = JSON.parse(JSON.stringify(baseData));

    // Round all percentages to whole numbers
    adjustedData = adjustedData.map((item) => ({
      ...item,
      value: Math.round(item.value), // Round to whole number
    }));

    // Check if there are any active filters
    const activeFilterCount = Object.values(selectedFilters).filter(
      (v) => v !== "all"
    ).length;
    if (activeFilterCount === 0) {
      return adjustedData;
    }

    // Define payer coverage adjustment factors for each condition
    const conditionAdjustments = {
      diabetes: {
        Medicare: 5,
        Medicaid: 3,
        "Blue Cross": -2,
        Aetna: 1,
        UnitedHealth: 0,
      },
      hypertension: {
        Medicare: 2,
        Medicaid: 1,
        "Blue Cross": 4,
        Aetna: 2,
        UnitedHealth: -1,
      },
      asthma: {
        Medicare: 1,
        Medicaid: 3,
        "Blue Cross": 2,
        Aetna: 0,
        UnitedHealth: -1,
      },
      heart: {
        Medicare: 4,
        Medicaid: -1,
        "Blue Cross": 2,
        Aetna: 1,
        UnitedHealth: 5,
      },
      cancer: {
        Medicare: 3,
        Medicaid: -2,
        "Blue Cross": 1,
        Aetna: 4,
        UnitedHealth: 2,
      },
    };

    // Define age group adjustment factors
    const ageGroupAdjustments = {
      "0-18": {
        Medicare: -4,
        Medicaid: 6,
        "Blue Cross": 2,
        Aetna: 1,
        UnitedHealth: 0,
      },
      "19-35": {
        Medicare: -3,
        Medicaid: 2,
        "Blue Cross": 3,
        Aetna: 2,
        UnitedHealth: 1,
      },
      "36-50": {
        Medicare: -1,
        Medicaid: 0,
        "Blue Cross": 2,
        Aetna: 3,
        UnitedHealth: 1,
      },
      "51-65": {
        Medicare: 2,
        Medicaid: -1,
        "Blue Cross": 1,
        Aetna: 2,
        UnitedHealth: 3,
      },
      "65+": {
        Medicare: 7,
        Medicaid: -3,
        "Blue Cross": -1,
        Aetna: 0,
        UnitedHealth: 2,
      },
    };

    // Apply condition filter adjustments if set
    if (selectedFilters.condition !== "all") {
      const normalizedCondition = selectedFilters.condition.toLowerCase();
      let matchedCondition = null;

      // Find matching condition
      for (const condition in conditionAdjustments) {
        if (
          condition.includes(normalizedCondition) ||
          normalizedCondition.includes(condition)
        ) {
          matchedCondition = condition;
          break;
        }
      }

      // Apply adjustments for the matched condition
      if (matchedCondition) {
        adjustedData = adjustedData.map((item) => {
          const adjustment =
            conditionAdjustments[matchedCondition][item.name] || 0;
          return {
            ...item,
            value: Math.min(100, Math.max(50, item.value + adjustment)),
          };
        });
      }
    }

    // Apply age group filter adjustments if set
    if (selectedFilters.ageGroup !== "all") {
      const adjustments = ageGroupAdjustments[selectedFilters.ageGroup];
      if (adjustments) {
        adjustedData = adjustedData.map((item) => {
          const adjustment = adjustments[item.name] || 0;
          return {
            ...item,
            value: Math.min(100, Math.max(50, item.value + adjustment)),
          };
        });
      }
    }

    // Add slight randomization for more dynamic feel while preserving patterns
    adjustedData = adjustedData.map((item) => ({
      ...item,
      value: Math.min(100, Math.max(50, item.value + (Math.random() * 4 - 2))),
    }));

    return adjustedData.map((item) => ({
      ...item,
      value: Math.round(item.value), // Ensure whole numbers when returning
    }));
  };

  // Generate a cost prediction based on input parameters
  const generateCostPrediction = () => {
    // Get age group from age
    let ageGroup;
    const age = parseInt(predictionParams.age);
    if (age <= 18) ageGroup = "0-18";
    else if (age <= 35) ageGroup = "19-35";
    else if (age <= 50) ageGroup = "36-50";
    else if (age <= 65) ageGroup = "51-65";
    else ageGroup = "65+";

    // Calculate predicted cost using the model
    const baseCost = costPredictionModel.baseCost;
    const ageFactor = costPredictionModel.ageFactor[ageGroup] || 1;
    const genderFactor =
      costPredictionModel.genderFactor[predictionParams.gender] || 1;
    const conditionFactor =
      costPredictionModel.conditionFactor[predictionParams.condition] || 1.2;
    const previousClaimsFactor =
      costPredictionModel.previousClaimsFactor[
        predictionParams.previousClaims
      ] || 1;
    const regionFactor =
      costPredictionModel.regionFactor[predictionParams.region] || 1;

    const predictedCost =
      baseCost *
      ageFactor *
      genderFactor *
      conditionFactor *
      previousClaimsFactor *
      regionFactor;

    // Generate range (±15% for prediction interval)
    const lowerBound = predictedCost * 0.85;
    const upperBound = predictedCost * 1.15;

    // Generate some comparable costs
    const averageCostForAge = baseCost * ageFactor;
    const averageCostForCondition = baseCost * conditionFactor;

    // Generate monthly prediction for a year
    const monthlyPredictions = [];
    let monthlyBase = predictedCost / 12;

    for (let i = 1; i <= 12; i++) {
      // Add some variability to monthly costs
      const variation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
      const monthlyCost = monthlyBase * variation;

      monthlyPredictions.push({
        month: i,
        cost: monthlyCost,
        cumulativeCost: monthlyBase * i,
      });
    }

    // Set prediction results
    setPredictionResults({
      predictedAnnualCost: predictedCost,
      lowerBound,
      upperBound,
      averageCostForAge,
      averageCostForCondition,
      monthlyPredictions,
      confidenceLevel: "85%",
      riskScore: Math.round(conditionFactor * previousClaimsFactor * 25),
      lastUpdated: new Date().toISOString(),
    });
  };

  // Get filtered data
  const filteredExpensesData = getFilteredExpensesData();
  const filteredClaimsData = getFilteredClaimsData();
  const filteredConditionCostData = getFilteredConditionCostData();

  // Colors for charts
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];
  const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const refreshData = () => {
    // Trigger data refresh
    setDataRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      alert("Data refreshed successfully!");
    }, 1000);
  };

  const resetFilters = () => {
    const defaultFilters = {
      ageGroup: "all",
      gender: "all",
      race: "all",
      condition: "all",
      location: "all",
      dateRange: "all",
      costRange: "all",
    };

    console.log("Resetting all filters to default values");

    // Reset filtered metrics to match the unfiltered data
    const resetMetrics = {
      filteredTotalExpenses:
        healthcareData?.metrics?.totalExpenses ||
        fallbackData.metrics.totalExpenses,
      filteredPatientCount:
        healthcareData?.metrics?.totalPatients ||
        fallbackData.metrics.totalPatients,
      filteredAvgClaimCost:
        healthcareData?.metrics?.avgClaimCost ||
        fallbackData.metrics.avgClaimCost,
    };

    console.log("Resetting metrics to:", resetMetrics);

    // Group state updates to prevent cascading renders
    setTempFilters({ ...defaultFilters });
    setSelectedFilters({ ...defaultFilters });
    setFilteredMetrics(resetMetrics);

    // Add a small delay before refreshing data
    setTimeout(() => {
      setDataRefreshKey((prev) => prev + 1);
      console.log("Filters have been reset successfully");
    }, 50);
  };

  const applyFilters = () => {
    // Apply the temporary filters to the actual filters
    const newFilters = { ...tempFilters };

    console.log("Applying filters:", newFilters);

    // Set flag to prevent recursive calculations
    window.applyingFilters = true;

    // Get filtered claims data based on the new filters BEFORE updating state
    const filteredClaims = getFilteredClaimsDataWithFilters(newFilters);
    console.log(`Filters applied. Found ${filteredClaims.length} claims.`);

    // If no claims match and multiple filters are active, show alert to user
    const activeFilterCount = Object.values(newFilters).filter(
      (value) => value !== "all"
    ).length;
    if (filteredClaims.length === 0 && activeFilterCount > 2) {
      alert(
        "No data matches all selected filters. The dashboard will display results with a more lenient filter application."
      );
    }

    // Explicitly recalculate metrics from the filtered claims
    let totalExpenses = 0;
    filteredClaims.forEach((claim) => {
      totalExpenses += claim.totalCost || 0;
    });

    // Count unique patients
    const uniquePatientIds = new Set();
    filteredClaims.forEach((claim) => {
      if (claim.patientId) {
        uniquePatientIds.add(claim.patientId);
      }
    });
    const patientCount = uniquePatientIds.size || 1;

    // Calculate average
    const avgClaimCost =
      filteredClaims.length > 0 ? totalExpenses / filteredClaims.length : 0;

    const shouldUseFallback =
      filteredClaims.length < 5 && activeFilterCount > 0;

    // Create the updated metrics object
    const updatedMetrics = {
      filteredTotalExpenses: shouldUseFallback
        ? (healthcareData?.metrics?.totalExpenses ||
            fallbackData.metrics.totalExpenses) *
          Math.max(0.1, 1 - activeFilterCount * 0.15)
        : Math.max(totalExpenses, 100),

      filteredPatientCount: shouldUseFallback
        ? Math.max(
            1,
            Math.round(
              (healthcareData?.metrics?.totalPatients ||
                fallbackData.metrics.totalPatients) *
                Math.max(0.1, 1 - activeFilterCount * 0.15)
            )
          )
        : Math.max(patientCount, 1),

      filteredAvgClaimCost: shouldUseFallback
        ? (healthcareData?.metrics?.avgClaimCost ||
            fallbackData.metrics.avgClaimCost) *
          Math.max(0.1, 1 - activeFilterCount * 0.15)
        : Math.max(avgClaimCost, 10),
    };

    console.log("Updated metrics:", updatedMetrics);

    // Apply the selected filters and metrics in a batch
    setSelectedFilters(newFilters);
    setFilteredMetrics(updatedMetrics);

    // Remove the dataRefreshKey update that was causing problems
    // setDataRefreshKey((prevKey) => prevKey + 1);

    // Clear the flag
    setTimeout(() => {
      window.applyingFilters = false;
    }, 100);

    // Run debug function for logging
    debugFilterResults();
  };

  const handleFilterChange = (filter, value) => {
    console.log(`Filter changed: ${filter} to ${value}`);
    // Just update the filter state without triggering immediate recalculation
    setTempFilters((prev) => ({
      ...prev,
      [filter]: value,
    }));
    // No longer triggers automatic update
  };

  // Helper function to get filter label
  const getFilterLabel = (key) => {
    switch (key) {
      case "ageGroup":
        return "Age";
      case "gender":
        return "Gender";
      case "race":
        return "Race";
      case "condition":
        return "Condition";
      case "location":
        return "City";
      case "dateRange":
        return "Date Range";
      case "costRange":
        return "Cost Range";
      default:
        return key;
    }
  };

  // Calculate KPI values based on filtered data
  const totalPatients =
    healthcareData?.metrics?.totalPatients ||
    fallbackData.metrics.totalPatients;
  const avgClaimCost =
    healthcareData?.metrics?.avgClaimCost || fallbackData.metrics.avgClaimCost;
  const totalExpenses =
    healthcareData?.metrics?.totalExpenses ||
    fallbackData.metrics.totalExpenses;

  // Export data in different formats
  const exportData = () => {
    // Prepare data for export
    const dataToExport = {
      patientCount: totalPatients,
      averageClaim: avgClaimCost,
      totalExpenses: totalExpenses,
      claims: filteredClaimsData,
      filters: selectedFilters,
    };

    console.log(`Exporting data in ${exportFormat} format:`, dataToExport);

    switch (exportFormat) {
      case "json":
        exportAsJson(dataToExport);
        break;
      case "csv":
        exportAsCsv(dataToExport);
        break;
      case "excel":
        exportAsExcel(dataToExport);
        break;
      case "pdf":
        exportAsPdf(dataToExport);
        break;
      default:
        exportAsJson(dataToExport);
    }

    setTimeout(() => {
      alert(
        `Data exported successfully as ${exportFormat.toUpperCase()} file!`
      );
      setShowExport(false);
    }, 500);
  };

  // Export as JSON
  const exportAsJson = (data) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    downloadFile(url, "healthcare_dashboard_export.json");
  };

  // Export as CSV
  const exportAsCsv = (data) => {
    // Convert claims data to CSV format
    const headers = [
      "date",
      "procedure",
      "patientId",
      "baseCost",
      "totalCost",
      "coveragePercent",
      "condition",
      "location",
    ];
    const csvRows = [headers.join(",")];

    data.claims.forEach((claim) => {
      const row = headers.map((header) => {
        const val = claim[header];
        // Handle strings with commas by wrapping in quotes
        return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
      });
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    downloadFile(url, "healthcare_dashboard_export.csv");
  };

  // Export as Excel (simplified - in reality would use a library like xlsx)
  const exportAsExcel = (data) => {
    // For demo purposes, we'll also generate a CSV and just change the extension
    // In a real app, you would use a library like xlsx or exceljs
    const headers = [
      "date",
      "procedure",
      "patientId",
      "baseCost",
      "totalCost",
      "coveragePercent",
      "condition",
      "location",
    ];
    const csvRows = [headers.join(",")];

    data.claims.forEach((claim) => {
      const row = headers.map((header) => claim[header]);
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);

    downloadFile(url, "healthcare_dashboard_export.xlsx");
  };

  // Export as PDF (simplified - in reality would use a library like jsPDF)
  const exportAsPdf = (data) => {
    // Create a more professional PDF with proper formatting
    try {
      // In a real application, you would use a proper PDF library like jsPDF
      // This is a simplified implementation for demonstration purposes

      // Create a hidden iframe to render the content
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      // Write the HTML content to the iframe
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Healthcare Dashboard Export</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                color: #333; 
                margin: 20px;
              }
              .header {
                background: linear-gradient(135deg, #4361ee, #3a0ca3);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              }
              .summary-box {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
              }
              table { 
                border-collapse: collapse; 
                width: 100%;
                margin-top: 20px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 12px 8px;
                text-align: left;
              }
              th { 
                background-color: #f2f2f2;
                font-weight: bold;
              }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
              .badge {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
              }
              .success { background-color: #e8f5e9; color: #4caf50; }
              .warning { background-color: #fff8e1; color: #ff9800; }
              .danger { background-color: #ffebee; color: #f44336; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Healthcare Dashboard Export</h1>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="summary-box">
              <h2>Executive Summary</h2>
              <p><strong>Total Patients:</strong> ${data.patientCount}</p>
              <p><strong>Average Claim Cost:</strong> $${data.averageClaim.toFixed(
                2
              )}</p>
              <p><strong>Total Expenses:</strong> $${data.totalExpenses.toFixed(
                2
              )}</p>
              <p><strong>Applied Filters:</strong> ${
                Object.entries(data.filters)
                  .filter(([_, value]) => value !== "all")
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ") || "None"
              }</p>
            </div>
            
            <h2>Claims Data</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Procedure</th>
                  <th>Patient ID</th>
                  <th>Total Cost</th>
                  <th>Coverage %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.claims
                  .slice(0, 20)
                  .map(
                    (claim) => `
                  <tr>
                    <td>${claim.date}</td>
                    <td>${claim.procedure}</td>
                    <td>${claim.patientId}</td>
                    <td>$${claim.totalCost.toFixed(2)}</td>
                    <td>${claim.coveragePercent}%</td>
                    <td>
                      <span class="badge ${
                        claim.coveragePercent > 80
                          ? "success"
                          : claim.coveragePercent > 60
                          ? "warning"
                          : "danger"
                      }">
                        ${
                          claim.coveragePercent > 80
                            ? "Approved"
                            : claim.coveragePercent > 60
                            ? "Pending"
                            : "Review"
                        }
                      </span>
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Healthcare Cost Prediction Dashboard • Confidential and Proprietary</p>
              <p>For internal use only. © ${new Date().getFullYear()} Healthcare Analytics</p>
            </div>
          </body>
        </html>
      `;

      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(html);
      iframe.contentWindow.document.close();

      // Use the browser's print to PDF functionality
      setTimeout(() => {
        iframe.contentWindow.print();
        document.body.removeChild(iframe);
      }, 500);

      return true;
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Fallback method - create a simplified version
      const blob = new Blob(
        [
          `Healthcare Dashboard Export\n\nTotal Patients: ${
            data.patientCount
          }\nAverage Claim: $${data.averageClaim.toFixed(
            2
          )}\nTotal Expenses: $${data.totalExpenses.toFixed(2)}`,
        ],
        { type: "application/pdf" }
      );
      const url = URL.createObjectURL(blob);
      downloadFile(url, "healthcare_dashboard_export.pdf");

      return false;
    }
  };

  // Helper for file downloads
  const downloadFile = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handler for updating user preferences
  const handlePreferenceChange = (preference, value) => {
    setUserPreferences((prev) => ({
      ...prev,
      [preference]: value,
    }));
  };

  // Handler for updating user profile
  const handleProfileChange = (field, value) => {
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Mark a notification as read
  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Handler for prediction parameter changes
  const handlePredictionParamChange = (param, value) => {
    setPredictionParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  // Toggle mobile filters panel
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  return (
    <div className={`dashboard-container ${theme}`}>
      <div className="floating-elements">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
      </div>

      <div className="particle-background">
        {/* JavaScript will add particles here */}
      </div>
      {/* Header */}
      <header className="dashboard-header">
        <div className="wave-pattern"></div>
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <div className="title">
          <h1>
            <i className="fas fa-hospital-user"></i> Healthcare Cost Prediction
            Dashboard
          </h1>
          <p>Analyze healthcare costs and make informed decisions</p>
        </div>
        <div className="user-actions">
          <button className="btn icon-btn" onClick={toggleTheme}>
            <i className="fas fa-moon hide-on-dark"></i>
            <i className="fas fa-sun show-on-dark"></i>
          </button>
          <button className="btn icon-btn" onClick={refreshData}>
            <i className="fas fa-sync-alt"></i>
          </button>
          <button className="btn icon-btn" onClick={() => setShowHelp(true)}>
            <i className="fas fa-question-circle"></i>
          </button>
          <button
            className="btn primary-btn"
            onClick={() => setShowExport(true)}
          >
            <i className="fas fa-download"></i> <span>Export</span>
          </button>
          <button
            className="btn icon-btn mobile-only"
            onClick={toggleMobileFilters}
          >
            <i className="fas fa-filter"></i>
          </button>
        </div>
      </header>

      {/* Info Bar */}
      <div className="info-bar">
        <div>Data source: Healthcare Claims Database</div>
        <div>
          {isDataLoaded ? (
            loadingError ? (
              <span style={{ color: "#f44336" }}>
                <i className="fas fa-exclamation-circle"></i> {loadingError}
              </span>
            ) : (
              <span>
                <i className="fas fa-check-circle"></i> Data loaded successfully
              </span>
            )
          ) : (
            <span>
              <i className="fas fa-spinner fa-spin"></i> Loading data...
            </span>
          )}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Navigation */}
        <nav className="navigation-bar">
          <div>
            <div className="nav-section">
              <h3>
                <i className="fas fa-compass"></i> Navigation
              </h3>
              <button
                className={`nav-link ${
                  activeView === "overview" ? "active" : ""
                }`}
                onClick={() => setActiveView("overview")}
              >
                <i className="fas fa-tachometer-alt"></i> Overview
              </button>

              <button
                className={`nav-link ${activeView === "costs" ? "active" : ""}`}
                onClick={() => setActiveView("costs")}
              >
                <i className="fas fa-chart-bar"></i> Cost Analysis
              </button>

              <button
                className={`nav-link ${
                  activeView === "claims" ? "active" : ""
                }`}
                onClick={() => setActiveView("claims")}
              >
                <i className="fas fa-file-invoice-dollar"></i> Claims
              </button>

              <button
                className={`nav-link ${
                  activeView === "prediction" ? "active" : ""
                }`}
                onClick={() => setActiveView("prediction")}
              >
                <i className="fas fa-brain"></i> Prediction
              </button>
            </div>

            <div className="nav-section">
              <h3>
                <i className="fas fa-cog"></i> Settings
              </h3>
              <button
                className={`nav-link ${
                  activeView === "settings" && activeSettingsView === "profile"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setActiveView("settings");
                  setActiveSettingsView("profile");
                }}
              >
                <i className="fas fa-user-cog"></i> User Profile
              </button>
              <button
                className={`nav-link ${
                  activeView === "settings" &&
                  activeSettingsView === "notifications"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setActiveView("settings");
                  setActiveSettingsView("notifications");
                }}
              >
                <i className="fas fa-bell"></i> Notifications
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="badge success" style={{ marginLeft: "5px" }}>
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
              <button
                className={`nav-link ${
                  activeView === "settings" &&
                  activeSettingsView === "preferences"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setActiveView("settings");
                  setActiveSettingsView("preferences");
                }}
              >
                <i className="fas fa-sliders-h"></i> Preferences
              </button>
            </div>
          </div>

          <div className="nav-footer">
            <div className="system-status">
              <div className="status-dot online"></div>
              System Online
            </div>
            <div>v1.0.0</div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {activeView === "overview" && (
            <>
              {/* KPI Cards */}
              <div className="content-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-chart-pie"></i> Key Performance
                    Indicators
                  </h2>
                  <div className="section-badge">
                    <i className="fas fa-calendar-alt"></i> Last 30 days
                  </div>
                </div>
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <i className="fas fa-users"></i>
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-title">Total Patients</div>
                      <div className="kpi-value">{totalPatients}</div>
                      <div className="kpi-change positive">
                        <i className="fas fa-arrow-up"></i> 12% from last month
                      </div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <i className="fas fa-receipt"></i>
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-title">Average Claim Cost</div>
                      <div className="kpi-value">
                        ${avgClaimCost.toFixed(2)}
                      </div>
                      <div className="kpi-change negative">
                        <i className="fas fa-arrow-down"></i> 3% from last month
                      </div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-title">Total Expenses</div>
                      <div className="kpi-value">
                        ${totalExpenses.toFixed(2)}
                      </div>
                      <div className="kpi-change positive">
                        <i className="fas fa-arrow-up"></i> 8% from last month
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="charts-container">
                {/* Expenses by Age & Race Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">
                      <i className="fas fa-chart-bar"></i> Healthcare Expenses
                      by Age & Race
                    </div>
                    <div className="chart-actions">
                      <button
                        className="btn icon-btn"
                        onClick={() =>
                          setMaximizedChart("expenses-by-age-race")
                        }
                      >
                        <i className="fas fa-expand-alt"></i>
                      </button>
                    </div>
                  </div>
                  <div className="chart-container" style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredExpensesData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ageGroup" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                        <Bar dataKey="White" fill={COLORS[0]} />
                        <Bar dataKey="Black" fill={COLORS[1]} />
                        <Bar dataKey="Asian" fill={COLORS[2]} />
                        <Bar dataKey="Hispanic" fill={COLORS[3]} />
                        <Bar dataKey="Other" fill={COLORS[4]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footer">
                    <div className="chart-insight">
                      <i className="fas fa-info-circle"></i> Highest expenses
                      observed in the 65+ age group across all demographics
                    </div>
                  </div>
                </div>

                {/* Top Procedures by Cost */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">
                      <i className="fas fa-procedures"></i> Top Procedures by
                      Cost
                    </div>
                    <div className="chart-actions">
                      <button
                        className="btn icon-btn"
                        onClick={() => setMaximizedChart("top-procedures")}
                      >
                        <i className="fas fa-expand-alt"></i>
                      </button>
                    </div>
                  </div>
                  <div
                    className="chart-container"
                    style={{ height: "400px", width: "100%" }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={getFilteredProceduresData()}
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip formatter={(value) => `${value}`} />
                        <Bar dataKey="cost" fill="#4361ee" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footer">
                    <div className="chart-insight">
                      <i className="fas fa-info-circle"></i> Specialized
                      procedures account for 65% of total costs
                    </div>
                  </div>
                </div>
              </div>

              {/* More Charts */}
              <div className="charts-container">
                {/* Cost Trends Over Time */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">
                      <i className="fas fa-chart-line"></i> Cost Trends Over
                      Time
                    </div>
                    <div className="chart-actions">
                      <button
                        className="btn icon-btn"
                        onClick={() => setMaximizedChart("cost-trends")}
                      >
                        <i className="fas fa-expand-alt"></i>
                      </button>
                    </div>
                  </div>
                  <div className="chart-container" style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getFilteredCostTrendsData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="hospitalCosts"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="primaryCare"
                          stroke="#82ca9d"
                        />
                        <Line
                          type="monotone"
                          dataKey="medications"
                          stroke="#ffc658"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footer">
                    <div className="chart-insight">
                      <i className="fas fa-info-circle"></i> Hospital costs are
                      consistently rising across all months
                    </div>
                  </div>
                </div>

                {/* Payer Coverage */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">
                      <i className="fas fa-percent"></i> Payer Coverage Rates
                    </div>
                    <div className="chart-actions">
                      <button
                        className="btn icon-btn"
                        onClick={() => setMaximizedChart("payer-coverage")}
                      >
                        <i className="fas fa-expand-alt"></i>
                      </button>
                    </div>
                  </div>
                  <div className="chart-container" style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getFilteredPayerCoverageData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) =>
                            `${name}: ${Math.round(value)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getFilteredPayerCoverageData().map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `${Math.round(value)}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footer">
                    <div className="chart-insight">
                      <i className="fas fa-info-circle"></i> Private insurers
                      provide highest average coverage rates
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Claims Table */}
              <div className="content-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-table"></i> Recent Claims
                  </h2>
                  <div className="search-container">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search claims..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={handleSearchFocus}
                    />
                    <i
                      className="fas fa-search search-icon"
                      onClick={handleSearchClick}
                    ></i>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Procedure</th>
                        <th>Patient ID</th>
                        <th>Base Cost</th>
                        <th>Total Cost</th>
                        <th>Coverage %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClaimsData.slice(0, 5).map((claim, index) => (
                        <tr key={index}>
                          <td>{claim.date}</td>
                          <td>{claim.procedure}</td>
                          <td>{claim.patientId}</td>
                          <td>${claim.baseCost?.toFixed(2) || "0.00"}</td>
                          <td>${claim.totalCost?.toFixed(2) || "0.00"}</td>
                          <td>{claim.coveragePercent || "0"}%</td>
                          <td>
                            <span
                              className={`badge ${
                                claim.coveragePercent > 80
                                  ? "success"
                                  : claim.coveragePercent > 60
                                  ? "warning"
                                  : "danger"
                              }`}
                            >
                              {claim.coveragePercent > 80
                                ? "Approved"
                                : claim.coveragePercent > 60
                                ? "Pending"
                                : "Review"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeView === "costs" && (
            <>
              <div className="content-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-dollar-sign"></i> Cost Analysis
                  </h2>
                  <div className="section-badge">
                    <i className="fas fa-filter"></i>{" "}
                    {
                      Object.values(selectedFilters).filter((v) => v !== "all")
                        .length
                    }{" "}
                    filters applied
                  </div>
                </div>

                {/* Cost Analysis KPIs */}
                <div
                  className="kpi-grid"
                  key={`cost-kpis-${dataRefreshKey}-${filteredMetrics.filteredTotalExpenses}-${filteredMetrics.filteredPatientCount}-${filteredMetrics.filteredAvgClaimCost}`}
                >
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <i className="fas fa-hand-holding-usd"></i>
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-title">Average Cost Per Patient</div>
                      <div className="kpi-value">
                        $
                        {(() => {
                          // Get current filtered values directly from state
                          const expenses =
                            filteredMetrics.filteredTotalExpenses;
                          const patients = filteredMetrics.filteredPatientCount;

                          // Calculate and format
                          const value = expenses / patients;
                          return isNaN(value) || !isFinite(value) || value === 0
                            ? (totalExpenses / totalPatients).toFixed(2)
                            : value.toFixed(2);
                        })()}
                      </div>
                      <div className="kpi-change positive">
                        <i className="fas fa-arrow-down"></i> 5.2% from last
                        month
                      </div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <i className="fas fa-hospital-user"></i>
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-title">Cost Per Encounter</div>
                      <div className="kpi-value">
                        $
                        {(() => {
                          // Get value directly from state
                          const avgCost = filteredMetrics.filteredAvgClaimCost;
                          const value = avgCost * 1.8;

                          return isNaN(value) || value === 0
                            ? (avgClaimCost * 1.8).toFixed(2)
                            : value.toFixed(2);
                        })()}
                      </div>
                      <div className="kpi-change negative">
                        <i className="fas fa-arrow-up"></i> 2.3% from last month
                      </div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <i className="fas fa-calendar-week"></i>
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-title">Monthly Trend</div>
                      <div className="kpi-value">
                        +$
                        {(() => {
                          // Use the current filteredMetrics instead of recalculating
                          const expenses =
                            filteredMetrics.filteredTotalExpenses;
                          const value = expenses * 0.06;
                          return isNaN(value) || value === 0
                            ? (totalExpenses * 0.06).toFixed(2)
                            : value.toFixed(2);
                        })()}
                      </div>
                      <div className="kpi-change negative">
                        <i className="fas fa-arrow-up"></i> Growing
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="charts-container">
                {/* Cost Drivers */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">
                      <i className="fas fa-sitemap"></i> Cost Drivers
                    </div>
                  </div>
                  <div className="chart-container" style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getFilteredCostDriversData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percentage }) =>
                            `${category}: ${percentage}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                        >
                          {getFilteredCostDriversData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Payer Analysis */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">
                      <i className="fas fa-building"></i> Payer Analysis
                    </div>
                  </div>
                  <div className="chart-container" style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getFilteredPayerAnalysisData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}`} />
                        <Legend />
                        <Bar
                          dataKey="covered"
                          name="Amount Covered"
                          fill="#4361ee"
                        />
                        <Bar
                          dataKey="uncovered"
                          name="Amount Uncovered"
                          fill="#f44336"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="charts-container">
                <CityCostComparison data={getFilteredCityData()} />

                {/* Cost Trend By Month */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">
                      <i className="fas fa-calendar-alt"></i> Cost Trend By
                      Month
                    </div>
                  </div>
                  <div className="chart-container" style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={
                          healthcareData?.dashboardData?.costTrendByMonthData ||
                          fallbackData.dashboardData.costTrendByMonthData
                        }
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}`} />
                        <Area
                          type="monotone"
                          dataKey="cost"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Condition Cost Analysis */}
              <div className="content-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-heartbeat"></i> Cost by Condition
                  </h2>
                </div>
                <div style={{ overflowX: "auto", padding: "1.5rem" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Condition</th>
                        <th>Average Cost</th>
                        <th>Patient Count</th>
                        <th>Total Cost</th>
                        <th>% of Budget</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConditionCostData.map((condition, index) => {
                        const totalCost =
                          condition.averageCost * condition.patientCount;
                        const percentOfBudget = (
                          (totalCost / totalExpenses) *
                          100
                        ).toFixed(1);
                        return (
                          <tr key={index}>
                            <td>{condition.condition}</td>
                            <td>${condition.averageCost.toFixed(2)}</td>
                            <td>{condition.patientCount}</td>
                            <td>${totalCost.toFixed(2)}</td>
                            <td>{percentOfBudget}%</td>
                            <td>
                              <span
                                className={`badge ${
                                  index % 3 === 0
                                    ? "danger"
                                    : index % 3 === 1
                                    ? "warning"
                                    : "success"
                                }`}
                              >
                                {index % 3 === 0 ? (
                                  <>
                                    <i className="fas fa-arrow-up"></i> Rising
                                  </>
                                ) : index % 3 === 1 ? (
                                  <>
                                    <i className="fas fa-arrows-alt-h"></i>{" "}
                                    Stable
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-arrow-down"></i>{" "}
                                    Falling
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeView === "claims" && (
            <>
              <div className="content-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-file-medical"></i> Claims Data
                  </h2>
                  <div className="search-container">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search claims..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={handleSearchFocus}
                    />
                    <i
                      className="fas fa-search search-icon"
                      onClick={handleSearchClick}
                    ></i>
                  </div>
                </div>

                {/* Claims KPIs */}
                <div
                  className="kpi-grid"
                  key={`claims-kpis-${dataRefreshKey}-${JSON.stringify(
                    selectedFilters
                  )}`}
                >
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <i className="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-title">Total Claims</div>
                      <div className="kpi-value">
                        {filteredClaimsData.length}
                      </div>
                      <div className="kpi-change positive">
                        <i className="fas fa-arrow-up"></i> 8.5% from last month
                      </div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-title">Approval Rate</div>
                      <div className="kpi-value">
                        {(() => {
                          // Force recalculation on each render
                          const approvedCount = filteredClaimsData.filter(
                            (c) => c.coveragePercent > 80
                          ).length;
                          const totalCount = filteredClaimsData.length;
                          return totalCount > 0
                            ? ((approvedCount / totalCount) * 100).toFixed(1)
                            : "0.0";
                        })()}
                        %
                      </div>
                      <div className="kpi-change positive">
                        <i className="fas fa-arrow-up"></i> 2.1% from last month
                      </div>
                    </div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <i className="fas fa-money-check-alt"></i>
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-title">Average Processing Time</div>
                      <div className="kpi-value">3.2 days</div>
                      <div className="kpi-change positive">
                        <i className="fas fa-arrow-down"></i> 0.5 days from last
                        month
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claims Visualization */}
              <div className="charts-container">
                {/* Claims by Age Group */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">
                      <i className="fas fa-users"></i> Claims by Age Group
                    </div>
                  </div>
                  <div className="chart-container" style={{ height: "300px" }}>
                    {filteredClaimsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart
                          key={`age-chart-${dataRefreshKey}-${JSON.stringify(
                            selectedFilters
                          )}`}
                        >
                          <Pie
                            data={(() => {
                              // Force recalculation on each render
                              console.log(
                                "Re-calculating age group data with current filters"
                              );

                              // Get the age distribution from filtered data
                              const ageDistribution = filteredClaimsData.reduce(
                                (acc, claim) => {
                                  const ageGroup = claim.ageGroup || "Unknown";
                                  acc[ageGroup] = (acc[ageGroup] || 0) + 1;
                                  return acc;
                                },
                                {}
                              );

                              // Convert to array format for chart
                              const chartData = Object.entries(ageDistribution)
                                .map(([age, count]) => ({
                                  name: age,
                                  value: count,
                                }))
                                .sort((a, b) => {
                                  // Sort age groups in logical order
                                  const ageOrder = {
                                    "0-18": 1,
                                    "19-35": 2,
                                    "36-50": 3,
                                    "51-65": 4,
                                    "65+": 5,
                                    Unknown: 6,
                                  };
                                  return (
                                    (ageOrder[a.name] || 999) -
                                    (ageOrder[b.name] || 999)
                                  );
                                });

                              // If no data or very few records, use fallback
                              if (
                                chartData.length < 2 ||
                                filteredClaimsData.length < 5
                              ) {
                                return [
                                  { name: "0-18", value: 10 },
                                  { name: "19-35", value: 25 },
                                  { name: "36-50", value: 30 },
                                  { name: "51-65", value: 25 },
                                  { name: "65+", value: 10 },
                                ];
                              }

                              return chartData;
                            })()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(() => {
                              // Same calculation to ensure colors match data
                              const ageDistribution = filteredClaimsData.reduce(
                                (acc, claim) => {
                                  const ageGroup = claim.ageGroup || "Unknown";
                                  acc[ageGroup] = (acc[ageGroup] || 0) + 1;
                                  return acc;
                                },
                                {}
                              );

                              const chartData = Object.entries(ageDistribution)
                                .map(([age, count]) => ({
                                  name: age,
                                  value: count,
                                }))
                                .sort((a, b) => {
                                  const ageOrder = {
                                    "0-18": 1,
                                    "19-35": 2,
                                    "36-50": 3,
                                    "51-65": 4,
                                    "65+": 5,
                                    Unknown: 6,
                                  };
                                  return (
                                    (ageOrder[a.name] || 999) -
                                    (ageOrder[b.name] || 999)
                                  );
                                });

                              if (
                                chartData.length < 2 ||
                                filteredClaimsData.length < 5
                              ) {
                                return [
                                  { name: "0-18", value: 10 },
                                  { name: "19-35", value: 25 },
                                  { name: "36-50", value: 30 },
                                  { name: "51-65", value: 25 },
                                  { name: "65+", value: 10 },
                                ].map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                  />
                                ));
                              }

                              return chartData.map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                                />
                              ));
                            })()}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data-message">
                        <i className="fas fa-info-circle"></i> No data available
                        for the selected filters. Try adjusting your filters.
                      </div>
                    )}
                  </div>
                </div>

                {/* Claims by Condition */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div className="chart-title">
                      <i className="fas fa-stethoscope"></i> Top Conditions
                    </div>
                  </div>
                  <div
                    className="chart-container"
                    style={{ height: "400px", width: "100%" }}
                  >
                    {filteredClaimsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getTopConditionsChartData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 70 }} // Increased bottom margin
                          key={`condition-chart-${dataRefreshKey}-${JSON.stringify(
                            selectedFilters
                          )}`}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="condition"
                            angle={-45} // Angled text
                            textAnchor="end" // Text alignment
                            height={70} // Increased height for labels
                            interval={0} // Force display of all labels
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            name="Number of Claims"
                            fill="#4361ee"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data-message">
                        <i className="fas fa-info-circle"></i> No data available
                        for the selected filters. Try adjusting your filters.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Claims Data Table */}
              <div className="content-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-table"></i> Detailed Claims
                  </h2>
                  <div className="section-badge">
                    <i className="fas fa-filter"></i>{" "}
                    {filteredClaimsData.length} records
                  </div>
                </div>
                {filteredClaimsData.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      className="data-table"
                      key={`claims-table-${dataRefreshKey}`}
                    >
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Procedure</th>
                          <th>Patient ID</th>
                          <th>Condition</th>
                          <th>Age Group</th>
                          <th>Gender</th>
                          <th>Base Cost</th>
                          <th>Total Cost</th>
                          <th>Coverage %</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSearchFilteredClaimsData(
                          filteredClaimsData,
                          searchTerm
                        )
                          .slice(0, 20)
                          .map((claim, index) => (
                            <tr key={index}>
                              <td>{claim.date}</td>
                              <td>{claim.procedure}</td>
                              <td>{claim.patientId}</td>
                              <td>{claim.condition}</td>
                              <td>{claim.ageGroup}</td>
                              <td>{claim.gender}</td>
                              <td>${claim.baseCost?.toFixed(2) || "0.00"}</td>
                              <td>${claim.totalCost?.toFixed(2) || "0.00"}</td>
                              <td>{claim.coveragePercent || "0"}%</td>
                              <td>
                                <span
                                  className={`badge ${
                                    claim.coveragePercent > 80
                                      ? "success"
                                      : claim.coveragePercent > 60
                                      ? "warning"
                                      : "danger"
                                  }`}
                                >
                                  {claim.coveragePercent > 80
                                    ? "Approved"
                                    : claim.coveragePercent > 60
                                    ? "Pending"
                                    : "Review"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {filteredClaimsData.length > 20 && (
                      <div style={{ padding: "1rem", textAlign: "center" }}>
                        <button className="btn secondary-btn">
                          <i className="fas fa-chevron-down"></i> Load More
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="no-data-message"
                    style={{ padding: "2rem", textAlign: "center" }}
                  >
                    <i
                      className="fas fa-search"
                      style={{
                        fontSize: "3rem",
                        color: "#ccc",
                        marginBottom: "1rem",
                      }}
                    ></i>
                    <h3>No Claims Found</h3>
                    <p>
                      No claims match your current filter criteria. With
                      multiple filters selected, it can be challenging to find
                      exact matches.
                    </p>
                    <p>
                      Consider using fewer filters or broaden your selection
                      criteria.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "1rem",
                        marginTop: "1rem",
                      }}
                    >
                      <button
                        className="btn primary-btn"
                        onClick={resetFilters}
                      >
                        <i className="fas fa-undo"></i> Reset All Filters
                      </button>
                      <button
                        className="btn secondary-btn"
                        onClick={() => {
                          // Keep only the first two filters
                          const activeFilters = Object.entries(selectedFilters)
                            .filter(([_, value]) => value !== "all")
                            .slice(0, 2);

                          const simplifiedFilters = { ...selectedFilters };
                          Object.keys(simplifiedFilters).forEach(
                            (key) => (simplifiedFilters[key] = "all")
                          );

                          activeFilters.forEach(([key, value]) => {
                            simplifiedFilters[key] = value;
                          });

                          setSelectedFilters(simplifiedFilters);
                          setTimeout(() => applyFilters(), 100);
                        }}
                      >
                        <i className="fas fa-filter"></i> Simplify Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeView === "prediction" && (
            <>
              <div className="content-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-chart-line"></i> Cost Prediction
                  </h2>
                </div>

                <div style={{ padding: "1.5rem" }}>
                  <div style={{ marginBottom: "2rem" }}>
                    <h3>
                      <i className="fas fa-cogs"></i> Prediction Parameters
                    </h3>
                    <p>
                      Adjust the parameters below to generate a cost prediction.
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "1rem",
                        marginTop: "1rem",
                      }}
                    >
                      <div className="filter-item">
                        <label htmlFor="predAge">Age</label>
                        <input
                          id="predAge"
                          type="number"
                          className="styled-select"
                          value={predictionParams.age}
                          onChange={(e) =>
                            handlePredictionParamChange("age", e.target.value)
                          }
                          min="0"
                          max="120"
                        />
                      </div>

                      <div className="filter-item">
                        <label htmlFor="predGender">Gender</label>
                        <select
                          id="predGender"
                          className="styled-select"
                          value={predictionParams.gender}
                          onChange={(e) =>
                            handlePredictionParamChange(
                              "gender",
                              e.target.value
                            )
                          }
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="filter-item">
                        <label htmlFor="predCondition">Primary Condition</label>
                        <select
                          id="predCondition"
                          className="styled-select"
                          value={predictionParams.condition}
                          onChange={(e) =>
                            handlePredictionParamChange(
                              "condition",
                              e.target.value
                            )
                          }
                        >
                          <option value="diabetes">Diabetes</option>
                          <option value="hypertension">Hypertension</option>
                          <option value="asthma">Asthma</option>
                          <option value="heart">Heart Disease</option>
                          <option value="cancer">Cancer</option>
                          <option value="arthritis">Arthritis</option>
                          <option value="depression">Depression</option>
                          <option value="anxiety">Anxiety</option>
                          <option value="obesity">Obesity</option>
                          <option value="copd">COPD</option>
                        </select>
                      </div>

                      <div className="filter-item">
                        <label htmlFor="predClaims">Previous Claims</label>
                        <select
                          id="predClaims"
                          className="styled-select"
                          value={predictionParams.previousClaims}
                          onChange={(e) =>
                            handlePredictionParamChange(
                              "previousClaims",
                              e.target.value
                            )
                          }
                        >
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4+">4+</option>
                        </select>
                      </div>

                      <div className="filter-item">
                        <label htmlFor="predRegion">Region</label>
                        <select
                          id="predRegion"
                          className="styled-select"
                          value={predictionParams.region}
                          onChange={(e) =>
                            handlePredictionParamChange(
                              "region",
                              e.target.value
                            )
                          }
                        >
                          <option value="northeast">Northeast</option>
                          <option value="midwest">Midwest</option>
                          <option value="south">South</option>
                          <option value="west">West</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: "1.5rem" }}>
                      <button
                        className="btn primary-btn"
                        onClick={generateCostPrediction}
                      >
                        <i className="fas fa-calculator"></i> Generate
                        Prediction
                      </button>
                    </div>
                  </div>

                  {predictionResults && (
                    <div style={{ marginTop: "2rem" }}>
                      <h3>
                        <i className="fas fa-chart-pie"></i> Prediction Results
                      </h3>

                      <div className="kpi-grid" style={{ marginTop: "1rem" }}>
                        <div className="kpi-card">
                          <div className="kpi-icon">
                            <i className="fas fa-dollar-sign"></i>
                          </div>
                          <div className="kpi-content">
                            <div className="kpi-title">
                              Predicted Annual Cost
                            </div>
                            <div className="kpi-value">
                              $
                              {predictionResults.predictedAnnualCost.toFixed(2)}
                            </div>
                            <div className="kpi-change">
                              <i className="fas fa-info-circle"></i> Confidence:{" "}
                              {predictionResults.confidenceLevel}
                            </div>
                          </div>
                        </div>

                        <div className="kpi-card">
                          <div className="kpi-icon">
                            <i className="fas fa-exchange-alt"></i>
                          </div>
                          <div className="kpi-content">
                            <div className="kpi-title">Prediction Range</div>
                            <div className="kpi-value">
                              ${predictionResults.lowerBound.toFixed(0)} - $
                              {predictionResults.upperBound.toFixed(0)}
                            </div>
                            <div className="kpi-change">
                              <i className="fas fa-info-circle"></i> 15%
                              deviation possible
                            </div>
                          </div>
                        </div>

                        <div className="kpi-card">
                          <div className="kpi-icon">
                            <i className="fas fa-exclamation-triangle"></i>
                          </div>
                          <div className="kpi-content">
                            <div className="kpi-title">Risk Score</div>
                            <div className="kpi-value">
                              {predictionResults.riskScore}/100
                            </div>
                            <div className="kpi-change">
                              <i className="fas fa-info-circle"></i>{" "}
                              {predictionResults.riskScore > 75
                                ? "High"
                                : predictionResults.riskScore > 50
                                ? "Medium"
                                : "Low"}{" "}
                              risk
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="charts-container">
                        {/* Monthly Cost Prediction */}
                        <div className="chart-card">
                          <div className="chart-header">
                            <div className="chart-title">
                              <i className="fas fa-calendar-alt"></i> Monthly
                              Cost Projection
                            </div>
                          </div>
                          <div
                            className="chart-container"
                            style={{ height: "300px" }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={predictionResults.monthlyPredictions}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="month"
                                  label={{
                                    value: "Month",
                                    position: "insideBottomRight",
                                    offset: -10,
                                  }}
                                />
                                <YAxis
                                  label={{
                                    value: "Cost ($)",
                                    angle: -90,
                                    position: "insideLeft",
                                  }}
                                />
                                <Tooltip
                                  formatter={(value) =>
                                    `${parseFloat(value).toFixed(2)}`
                                  }
                                />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="cost"
                                  name="Monthly Cost"
                                  stroke="#8884d8"
                                  activeDot={{ r: 8 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="cumulativeCost"
                                  name="Cumulative Cost"
                                  stroke="#82ca9d"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Comparative Analysis */}
                        <div className="chart-card">
                          <div className="chart-header">
                            <div className="chart-title">
                              <i className="fas fa-balance-scale"></i>{" "}
                              Comparative Analysis
                            </div>
                          </div>
                          <div
                            className="chart-container"
                            style={{ height: "300px" }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  {
                                    name: "Age Group Average",
                                    value: predictionResults.averageCostForAge,
                                  },
                                  {
                                    name: "Condition Average",
                                    value:
                                      predictionResults.averageCostForCondition,
                                  },
                                  {
                                    name: "Your Prediction",
                                    value:
                                      predictionResults.predictedAnnualCost,
                                  },
                                ]}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 50,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="name"
                                  height={60}
                                  tick={{
                                    angle: 0,
                                    textAnchor: "middle",
                                    dy: 20,
                                  }}
                                  tickSize={8}
                                  interval={0}
                                />
                                <YAxis />
                                <Tooltip
                                  formatter={(value) =>
                                    `$${parseFloat(value).toFixed(2)}`
                                  }
                                />
                                <Bar dataKey="value" fill="#4361ee">
                                  {[0, 1, 2].map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      cursor="pointer"
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "2rem",
                          backgroundColor: "#f8f9fa",
                          padding: "1.5rem",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                        }}
                        className={theme === "dark" ? "dark" : ""}
                      >
                        <h4>
                          <i className="fas fa-lightbulb"></i> Insights &
                          Recommendations
                        </h4>
                        <ul
                          style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}
                        >
                          <li>
                            Your predicted annual healthcare cost is{" "}
                            <strong>
                              $
                              {predictionResults.predictedAnnualCost.toFixed(2)}
                            </strong>
                            , which is{" "}
                            {predictionResults.predictedAnnualCost >
                            predictionResults.averageCostForAge
                              ? "higher"
                              : "lower"}{" "}
                            than the average for your age group ($
                            {predictionResults.averageCostForAge.toFixed(2)}).
                          </li>
                          <li>
                            The primary cost driver for your prediction is your
                            condition:{" "}
                            <strong>{predictionParams.condition}</strong>.
                          </li>
                          <li>
                            Consider preventive care measures to manage{" "}
                            {predictionParams.condition} and potentially reduce
                            future costs.
                          </li>
                          <li>
                            Based on your risk score, consider reviewing your
                            coverage options to ensure adequate protection.
                          </li>
                          <li>
                            Monthly cost monitoring is recommended to track
                            expenses against projections.
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeView === "settings" && activeSettingsView === "profile" && (
            <div className="content-section">
              <div className="section-header">
                <h2>
                  <i className="fas fa-user-cog"></i> User Profile
                </h2>
              </div>
              <div style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "2rem",
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      backgroundColor: "#4361ee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "2rem",
                    }}
                  >
                    <i
                      className="fas fa-user"
                      style={{ fontSize: "3rem", color: "white" }}
                    ></i>
                  </div>
                  <div>
                    <h3 style={{ marginBottom: "0.5rem" }}>
                      {userProfile.name}
                    </h3>
                    <p style={{ margin: "0.25rem 0" }}>
                      <i className="fas fa-briefcase"></i> {userProfile.role}
                    </p>
                    <p style={{ margin: "0.25rem 0" }}>
                      <i className="fas fa-building"></i>{" "}
                      {userProfile.department}
                    </p>
                    <p style={{ margin: "0.25rem 0" }}>
                      <i className="fas fa-envelope"></i> {userProfile.email}
                    </p>
                    <p style={{ margin: "0.25rem 0" }}>
                      <i className="fas fa-clock"></i> Last login:{" "}
                      {userProfile.lastLogin}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <h3>
                    <i className="fas fa-info-circle"></i> Personal Information
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "1rem",
                      marginTop: "1rem",
                    }}
                  >
                    <div className="filter-item">
                      <label htmlFor="userName">Full Name</label>
                      <input
                        id="userName"
                        type="text"
                        className="styled-select"
                        value={userProfile.name}
                        onChange={(e) =>
                          handleProfileChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div className="filter-item">
                      <label htmlFor="userEmail">Email Address</label>
                      <input
                        id="userEmail"
                        type="email"
                        className="styled-select"
                        value={userProfile.email}
                        onChange={(e) =>
                          handleProfileChange("email", e.target.value)
                        }
                      />
                    </div>
                    <div className="filter-item">
                      <label htmlFor="userRole">Role</label>
                      <input
                        id="userRole"
                        type="text"
                        className="styled-select"
                        value={userProfile.role}
                        onChange={(e) =>
                          handleProfileChange("role", e.target.value)
                        }
                      />
                    </div>
                    <div className="filter-item">
                      <label htmlFor="userDepartment">Department</label>
                      <input
                        id="userDepartment"
                        type="text"
                        className="styled-select"
                        value={userProfile.department}
                        onChange={(e) =>
                          handleProfileChange("department", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <h3>
                    <i className="fas fa-lock"></i> Security
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "1rem",
                      marginTop: "1rem",
                    }}
                  >
                    <div className="filter-item">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input
                        id="currentPassword"
                        type="password"
                        className="styled-select"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="filter-item">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        id="newPassword"
                        type="password"
                        className="styled-select"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "2rem" }}>
                  <button className="btn primary-btn">
                    <i className="fas fa-save"></i> Save Changes
                  </button>
                  <button
                    className="btn secondary-btn"
                    style={{ marginLeft: "1rem" }}
                  >
                    <i className="fas fa-undo"></i> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === "settings" &&
            activeSettingsView === "notifications" && (
              <div className="content-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-bell"></i> Notification Center
                  </h2>
                  <button
                    className="btn secondary-btn"
                    onClick={clearAllNotifications}
                  >
                    <i className="fas fa-trash"></i> Clear All
                  </button>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                      <i
                        className="fas fa-check-circle"
                        style={{
                          fontSize: "3rem",
                          color: "#4caf50",
                          marginBottom: "1rem",
                        }}
                      ></i>
                      <h3>No Notifications</h3>
                      <p>
                        You're all caught up! There are no notifications to
                        display.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          style={{
                            padding: "1rem",
                            borderLeft: notification.read
                              ? "4px solid #e0e0e0"
                              : "4px solid #4361ee",
                            marginBottom: "1rem",
                            backgroundColor: notification.read
                              ? "transparent"
                              : "rgba(67, 97, 238, 0.05)",
                            borderRadius: "4px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <h4 style={{ margin: 0 }}>
                              {!notification.read && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor: "#4361ee",
                                    marginRight: "0.5rem",
                                  }}
                                ></span>
                              )}
                              {notification.title}
                            </h4>
                            <span
                              style={{ fontSize: "0.85rem", color: "#666" }}
                            >
                              {notification.date}
                            </span>
                          </div>
                          <p style={{ margin: "0.5rem 0" }}>
                            {notification.message}
                          </p>
                          <div style={{ marginTop: "0.5rem" }}>
                            {!notification.read && (
                              <button
                                className="btn secondary-btn"
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  fontSize: "0.8rem",
                                }}
                                onClick={() =>
                                  markNotificationAsRead(notification.id)
                                }
                              >
                                <i className="fas fa-check"></i> Mark as Read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: "2rem" }}>
                    <h3>
                      <i className="fas fa-cog"></i> Notification Settings
                    </h3>
                    <div style={{ marginTop: "1rem" }}>
                      <div className="filter-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={userPreferences.notifications}
                            onChange={(e) =>
                              handlePreferenceChange(
                                "notifications",
                                e.target.checked
                              )
                            }
                          />
                          Enable Notifications
                        </label>
                      </div>
                      <div className="filter-item">
                        <label>
                          <input type="checkbox" defaultChecked />
                          Email Notifications
                        </label>
                      </div>
                      <div className="filter-item">
                        <label>
                          <input type="checkbox" defaultChecked />
                          Cost Alert Notifications
                        </label>
                      </div>
                      <div className="filter-item">
                        <label>
                          <input type="checkbox" defaultChecked />
                          System Update Notifications
                        </label>
                      </div>
                      <div className="filter-item">
                        <label>
                          <input type="checkbox" defaultChecked />
                          Data Refresh Notifications
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {activeView === "settings" &&
            activeSettingsView === "preferences" && (
              <div className="content-section">
                <div className="section-header">
                  <h2>
                    <i className="fas fa-sliders-h"></i> User Preferences
                  </h2>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ marginBottom: "2rem" }}>
                    <h3>
                      <i className="fas fa-desktop"></i> Display Settings
                    </h3>
                    <div style={{ marginTop: "1rem" }}>
                      <div className="filter-item">
                        <label htmlFor="themePreference">Theme</label>
                        <select
                          id="themePreference"
                          className="styled-select"
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                      <div className="filter-item">
                        <label htmlFor="defaultView">Default View</label>
                        <select
                          id="defaultView"
                          className="styled-select"
                          value={userPreferences.defaultView}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "defaultView",
                              e.target.value
                            )
                          }
                        >
                          <option value="overview">Overview</option>
                          <option value="costs">Cost Analysis</option>
                          <option value="claims">Claims</option>
                          <option value="prediction">Prediction</option>
                        </select>
                      </div>
                      <div className="filter-item">
                        <label htmlFor="chartType">Preferred Chart Type</label>
                        <select
                          id="chartType"
                          className="styled-select"
                          value={userPreferences.chartType}
                          onChange={(e) =>
                            handlePreferenceChange("chartType", e.target.value)
                          }
                        >
                          <option value="bar">Bar Chart</option>
                          <option value="line">Line Chart</option>
                          <option value="pie">Pie Chart</option>
                          <option value="area">Area Chart</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "2rem" }}>
                    <h3>
                      <i className="fas fa-sync-alt"></i> Data Settings
                    </h3>
                    <div style={{ marginTop: "1rem" }}>
                      <div className="filter-item">
                        <label htmlFor="dataRefreshInterval">
                          Data Refresh Interval
                        </label>
                        <select
                          id="dataRefreshInterval"
                          className="styled-select"
                          value={userPreferences.dataRefreshInterval}
                          onChange={(e) =>
                            handlePreferenceChange(
                              "dataRefreshInterval",
                              e.target.value
                            )
                          }
                        >
                          <option value="manual">Manual Only</option>
                          <option value="1h">Every Hour</option>
                          <option value="6h">Every 6 Hours</option>
                          <option value="12h">Every 12 Hours</option>
                          <option value="24h">Daily</option>
                        </select>
                      </div>
                      <div className="filter-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={userPreferences.autoExport}
                            onChange={(e) =>
                              handlePreferenceChange(
                                "autoExport",
                                e.target.checked
                              )
                            }
                          />
                          Auto-Export Data Daily
                        </label>
                      </div>
                      <div className="filter-item">
                        <label>
                          <input type="checkbox" defaultChecked />
                          Show Data Labels on Charts
                        </label>
                      </div>
                      <div className="filter-item">
                        <label>
                          <input type="checkbox" defaultChecked />
                          Enable Animations
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "2rem" }}>
                    <button className="btn primary-btn">
                      <i className="fas fa-save"></i> Save Preferences
                    </button>
                    <button
                      className="btn secondary-btn"
                      style={{ marginLeft: "1rem" }}
                    >
                      <i className="fas fa-undo"></i> Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            )}
        </main>

        {/* Data Dimensions Sidebar */}
        <aside
          className={`data-dimensions ${
            showMobileFilters ? "mobile-show" : ""
          }`}
        >
          <div className="filter-header">
            <h3>
              <i className="fas fa-filter"></i> Data Filters
            </h3>
            <button
              className="btn icon-btn mobile-only"
              onClick={toggleMobileFilters}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="filter-body">
            <div className="filter-section">
              <h4>
                <i className="fas fa-sliders-h"></i> Filter Dimensions
              </h4>

              <div className="filter-item">
                <label htmlFor="ageGroup">Age Group</label>
                <select
                  id="ageGroup"
                  className="styled-select"
                  value={tempFilters.ageGroup}
                  onChange={(e) =>
                    handleFilterChange("ageGroup", e.target.value)
                  }
                >
                  <option value="all">All Age Groups</option>
                  <option value="0-18">0-18 years</option>
                  <option value="19-35">19-35 years</option>
                  <option value="36-50">36-50 years</option>
                  <option value="51-65">51-65 years</option>
                  <option value="65+">65+ years</option>
                </select>
              </div>

              <div className="filter-item">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  className="styled-select"
                  value={tempFilters.gender}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="filter-item">
                <label htmlFor="race">Race/Ethnicity</label>
                <select
                  id="race"
                  className="styled-select"
                  value={tempFilters.race}
                  onChange={(e) => handleFilterChange("race", e.target.value)}
                >
                  <option value="all">All Races</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="asian">Asian</option>
                  <option value="hispanic">Hispanic</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="filter-item">
                <label htmlFor="condition">Condition</label>
                <select
                  id="condition"
                  className="styled-select"
                  value={tempFilters.condition}
                  onChange={(e) =>
                    handleFilterChange("condition", e.target.value)
                  }
                >
                  <option value="all">All Conditions</option>
                  <option value="diabetes">Diabetes</option>
                  <option value="hypertension">Hypertension</option>
                  <option value="asthma">Asthma</option>
                  <option value="heart">Heart Conditions</option>
                  <option value="cancer">Cancer</option>
                </select>
              </div>

              <div className="filter-item">
                <label htmlFor="location">Location</label>
                <select
                  id="location"
                  className="styled-select"
                  value={tempFilters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                >
                  <option value="all">All Locations</option>
                  <option value="hayward">Hayward</option>
                  <option value="oakland">Oakland</option>
                  <option value="san_francisco">San Francisco</option>
                  <option value="palo_alto">Palo Alto</option>
                  <option value="san_jose">San Jose</option>
                </select>
              </div>

              <div className="filter-item">
                <label htmlFor="costRange">Cost Range</label>
                <select
                  id="costRange"
                  className="styled-select"
                  value={tempFilters.costRange}
                  onChange={(e) =>
                    handleFilterChange("costRange", e.target.value)
                  }
                >
                  <option value="all">All Cost Ranges</option>
                  <option value="low">Low (&lt; $1,000)</option>
                  <option value="medium">Medium ($1,000 - $5,000)</option>
                  <option value="high">High (&gt; $5,000)</option>
                </select>
              </div>

              <div className="filter-item">
                <label htmlFor="dateRange">Date Range</label>
                <select
                  id="dateRange"
                  className="styled-select"
                  value={tempFilters.dateRange}
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value)
                  }
                >
                  <option value="all">All Dates</option>
                  <option value="current_month">Current Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="last_3_months">Last 3 Months</option>
                  <option value="last_6_months">Last 6 Months</option>
                  <option value="last_year">Last Year</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn primary-btn" onClick={applyFilters}>
                Apply Filters
              </button>
              <button className="btn secondary-btn" onClick={resetFilters}>
                Reset
              </button>
            </div>
          </div>

          <div className="filter-footer">
            <div className="selected-filters">
              <h4>Selected Filters</h4>
              <div className="filter-tags">
                {Object.entries(tempFilters).map(([key, value]) =>
                  value !== "all" ? (
                    <div
                      key={key}
                      className="filter-tag"
                      onClick={() => handleFilterChange(key, "all")}
                    >
                      {getFilterLabel(key)}: {value}{" "}
                      <i className="fas fa-times"></i>
                    </div>
                  ) : null
                )}
                {Object.values(tempFilters).every(
                  (value) => value === "all"
                ) && <span>No filters selected</span>}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <i className="fas fa-question-circle"></i> Help & Documentation
              </h2>
              <span className="close-btn" onClick={() => setShowHelp(false)}>
                &times;
              </span>
            </div>
            <div className="help-content">
              <div className="help-section">
                <h3>Getting Started</h3>
                <p>
                  The Healthcare Cost Prediction Dashboard provides insights
                  into healthcare costs, trends, and predictions. Use the
                  navigation menu on the left to switch between different views.
                </p>
                <ul>
                  <li>
                    <strong>Overview:</strong> See all key metrics and charts at
                    a glance
                  </li>
                  <li>
                    <strong>Cost Analysis:</strong> Detailed breakdown of
                    healthcare costs by various dimensions
                  </li>
                  <li>
                    <strong>Claims:</strong> View and analyze individual claims
                    data
                  </li>
                  <li>
                    <strong>Prediction:</strong> Access cost prediction tools
                    based on patient profiles and conditions
                  </li>
                  <li>
                    <strong>Settings:</strong> Customize your user profile,
                    notifications, and preferences
                  </li>
                </ul>
              </div>
              <div className="help-section">
                <h3>Using Filters</h3>
                <p>
                  Use the filters panel on the right to narrow down data by:
                </p>
                <ul>
                  <li>Age Group</li>
                  <li>Gender</li>
                  <li>Race/Ethnicity</li>
                  <li>Condition</li>
                  <li>Location</li>
                  <li>Cost Range</li>
                  <li>Date Range</li>
                </ul>
                <p>
                  Click "Apply Filters" to update visualizations or "Reset" to
                  clear all filters.
                </p>
              </div>
              <div className="help-section">
                <h3>Exporting Data</h3>
                <p>
                  Click the "Export" button in the top-right corner to download
                  data in various formats:
                </p>
                <ul>
                  <li>
                    <strong>JSON:</strong> For data processing and integration
                  </li>
                  <li>
                    <strong>CSV:</strong> For spreadsheet analysis
                  </li>
                  <li>
                    <strong>Excel:</strong> For detailed data manipulation
                  </li>
                  <li>
                    <strong>PDF:</strong> For reporting and sharing
                  </li>
                </ul>
              </div>
              <div className="help-section">
                <h3>Cost Prediction</h3>
                <p>
                  The prediction engine uses historical data and machine
                  learning to forecast healthcare costs. Enter patient
                  parameters such as age, gender, and condition to generate
                  personalized predictions.
                </p>
              </div>
              <div className="help-section">
                <h3>Need More Help?</h3>
                <p>
                  For additional support, please contact our technical support
                  team at support@healthcare-dashboard.com or call (800)
                  555-1234 during business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <i className="fas fa-download"></i> Export Dashboard Data
              </h2>
              <span className="close-btn" onClick={() => setShowExport(false)}>
                &times;
              </span>
            </div>
            <div>
              <div className="export-options">
                <div
                  className={`export-option ${
                    exportFormat === "json" ? "active" : ""
                  }`}
                  onClick={() => setExportFormat("json")}
                >
                  <i className="fas fa-file-code"></i>
                  <div>JSON</div>
                </div>
                <div
                  className={`export-option ${
                    exportFormat === "csv" ? "active" : ""
                  }`}
                  onClick={() => setExportFormat("csv")}
                >
                  <i className="fas fa-file-csv"></i>
                  <div>CSV</div>
                </div>
                <div
                  className={`export-option ${
                    exportFormat === "excel" ? "active" : ""
                  }`}
                  onClick={() => setExportFormat("excel")}
                >
                  <i className="fas fa-file-excel"></i>
                  <div>Excel</div>
                </div>
                <div
                  className={`export-option ${
                    exportFormat === "pdf" ? "active" : ""
                  }`}
                  onClick={() => setExportFormat("pdf")}
                >
                  <i className="fas fa-file-pdf"></i>
                  <div>PDF</div>
                </div>
              </div>

              <div className="export-settings">
                <h3>Export Settings</h3>
                <div className="filter-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Include KPI metrics
                  </label>
                </div>
                <div className="filter-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Include charts data
                  </label>
                </div>
                <div className="filter-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Include claims data
                  </label>
                </div>
                <div className="filter-item">
                  <label>
                    <input type="checkbox" defaultChecked /> Include filter
                    settings
                  </label>
                </div>

                {exportFormat === "excel" && (
                  <>
                    <div className="filter-item">
                      <label>
                        <input type="checkbox" defaultChecked /> Include
                        formatted tables
                      </label>
                    </div>
                    <div className="filter-item">
                      <label>
                        <input type="checkbox" defaultChecked /> Auto-size
                        columns
                      </label>
                    </div>
                  </>
                )}

                {exportFormat === "pdf" && (
                  <>
                    <div className="filter-item">
                      <label>
                        <input type="checkbox" defaultChecked /> Include
                        visualizations
                      </label>
                    </div>
                    <div className="filter-item">
                      <label>
                        <input type="checkbox" defaultChecked /> Add page
                        numbers
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div
                className="filter-actions"
                style={{ padding: "15px 0", display: "flex", gap: "10px" }}
              >
                <button
                  className="btn primary-btn"
                  onClick={exportData}
                  style={{ padding: "10px 20px", fontSize: "1rem" }}
                >
                  <i
                    className="fas fa-download"
                    style={{ marginRight: "8px" }}
                  ></i>{" "}
                  Export as {exportFormat.toUpperCase()}
                </button>
                <button
                  className="btn secondary-btn"
                  onClick={() => setShowExport(false)}
                  style={{ padding: "10px 20px", fontSize: "1rem" }}
                >
                  <i
                    className="fas fa-times"
                    style={{ marginRight: "8px" }}
                  ></i>{" "}
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Maximized Chart Modal */}
      {maximizedChart && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ width: "90%", maxWidth: "1200px", height: "90%" }}
          >
            <div className="modal-header">
              <h2>
                {maximizedChart === "expenses-by-age-race" && (
                  <>
                    <i className="fas fa-chart-bar"></i> Healthcare Expenses by
                    Age & Race
                  </>
                )}
                {maximizedChart === "top-procedures" && (
                  <>
                    <i className="fas fa-procedures"></i> Top Procedures by Cost
                  </>
                )}
                {maximizedChart === "cost-trends" && (
                  <>
                    <i className="fas fa-chart-line"></i> Cost Trends Over Time
                  </>
                )}
                {maximizedChart === "payer-coverage" && (
                  <>
                    <i className="fas fa-percent"></i> Payer Coverage Rates
                  </>
                )}
                {/* Add cases for all your chart types */}
              </h2>
              <span
                className="close-btn"
                onClick={() => setMaximizedChart(null)}
              >
                &times;
              </span>
            </div>
            <div style={{ height: "calc(100% - 60px)", padding: "20px" }}>
              {maximizedChart === "expenses-by-age-race" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredExpensesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}`} />
                    <Legend />
                    <Bar dataKey="White" fill={COLORS[0]} />
                    <Bar dataKey="Black" fill={COLORS[1]} />
                    <Bar dataKey="Asian" fill={COLORS[2]} />
                    <Bar dataKey="Hispanic" fill={COLORS[3]} />
                    <Bar dataKey="Other" fill={COLORS[4]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {maximizedChart === "top-procedures" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={getFilteredProceduresData()}
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => `${value}`} />
                    <Bar dataKey="cost" fill="#4361ee" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {maximizedChart === "cost-trends" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getFilteredCostTrendsData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hospitalCosts"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="primaryCare"
                      stroke="#82ca9d"
                    />
                    <Line
                      type="monotone"
                      dataKey="medications"
                      stroke="#ffc658"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {maximizedChart === "payer-coverage" && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getFilteredPayerCoverageData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getFilteredPayerCoverageData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthcareDashboard;
