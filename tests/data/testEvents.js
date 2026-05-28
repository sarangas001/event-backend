const eventData = {
  title: "Annual Music Concert",
  description: "Music concert with popular singers.",
  category: "Music",
  venue: "Bandaranayake Hall",
  startDate: "2025-11-07",
  startTime: "16:00",
  endDate: "2025-11-07",
  endTime: "20:00",
  participantsCount: 100,
  isApproved: true,
  organizationId: "OC1234"
};

// Additional events for "fetch all" tests
const multipleEventsData = [
  {
    title: "Annual Music Concert",
    description: "Music concert with popular singers.",
    category: "Music",
    venue: "Bandaranayake Hall",
    startDate: "2025-11-07",
    startTime: "16:00",
    endDate: "2025-11-07",
    endTime: "20:00",
    participantsCount: 100,
    isApproved: true,
    organizationId: "OC1234"
  },
  {
    title: "Tech Expo 2025",
    description: "Technology exhibition with new gadgets.",
    category: "Technology",
    venue: "Colombo Exhibition Hall",
    startDate: "2025-12-01",
    startTime: "09:00",
    endDate: "2025-12-01",
    endTime: "18:00",
    participantsCount: 200,
    isApproved: false,
    organizationId: "OC5678"
  },
  {
    title: "Art & Culture Fair",
    description: "Showcase of local artists and performances.",
    category: "Art",
    venue: "National Art Gallery",
    startDate: "2025-11-20",
    startTime: "10:00",
    endDate: "2025-11-20",
    endTime: "17:00",
    participantsCount: 150,
    isApproved: true,
    organizationId: "OC9101"
  }
];

const missingFieldTests = [
    { field: 'title', expectedMessage: 'Missing tittle' },
    { field: 'description', expectedMessage: 'Missing Description' },
    { field: 'category', expectedMessage: 'Missing Category' },
    { field: 'venue', expectedMessage: 'Missing Venue' },
    { field: 'startDate', expectedMessage: 'Missing Start Date' },
    { field: 'startTime', expectedMessage: 'Missing Start Time' },
    { field: 'endDate', expectedMessage: 'Missing End Date' },
    { field: 'endTime', expectedMessage: 'Missing End Time' },
    { field: 'participantsCount', expectedMessage: 'Missing Participants Count' },
];

// Arrays of invalid values with exact expected messages

const invalidTitles = [
  { value: 123, expectedMessage: "Invalid title" },
  { value: {}, expectedMessage: "Invalid title" },
  { value: [], expectedMessage: "Invalid title" }
];

const invalidDescriptions = [
  { value: 123, expectedMessage: "Invalid Description" },
  { value: {}, expectedMessage: "Invalid Description" },
  { value: [], expectedMessage: "Invalid Description" }
];

const invalidCategories = [
  { value: "123", expectedMessage: "Invalid Category" },
  { value: {}, expectedMessage: "Invalid Category" },
  { value: [], expectedMessage: "Invalid Category" }
];

const invalidVenues = [
  { value: 123, expectedMessage: "Invlid Venue" },
  { value: {}, expectedMessage: "Invlid Venue" },
  { value: [], expectedMessage: "Invlid Venue" }
];

const invalidStartDates = [
  { value: "Invalid Date", expectedMessage: "Invlid Start Date" },
  { value: "2025-02-30", expectedMessage: "Invlid Start Date" },
  { value: "15/10/2025", expectedMessage: "Invlid Start Date" },
  { value: 123, expectedMessage: "Invlid Start Date" }
];

const invalidStartTimes = [
  { value: "25:00", expectedMessage: "Invlid Start Time" },
  { value: "abc", expectedMessage: "Invlid Start Time" },
  { value: 123, expectedMessage: "Invlid Start Time" },
  { value: "9am", expectedMessage: "Invlid Start Time" }
];

const invalidEndDates = [
  { value: "Invalid Date", expectedMessage: "Invlid End Date" },
  { value: "2025-02-30", expectedMessage: "Invlid End Date" },
  { value: "01-12-2025", expectedMessage: "Invlid End Date" },
  { value: 123, expectedMessage: "Invlid End Date" }
];

const invalidEndTimes = [
  { value: "25:00", expectedMessage: "Invlid End Time" },
  { value: "abc", expectedMessage: "Invlid End Time" },
  { value: 123, expectedMessage: "Invlid End Time" },
  { value: "5pm", expectedMessage: "Invlid End Time" }
];

const invalidParticipantsCounts = [
  { value: -1, expectedMessage: "Invalid Participants Count" },
  { value: 0, expectedMessage: "Invalid Participants Count" },
  { value: "abc", expectedMessage: "Invalid Participants Count" },
  { value: {}, expectedMessage: "Invalid Participants Count" },
  { value: [], expectedMessage: "Invalid Participants Count" }
];

const invalidFieldTests = [
     { field: 'startDate', invalidValues: invalidStartDates },
     { field: 'startTime', invalidValues: invalidStartTimes },
     { field: 'endDate', invalidValues: invalidEndDates },
     { field: 'endTime', invalidValues: invalidEndTimes },
];

const updateEventData = { 
  title: "Updated Annual Music Concert",
  description: "Updated description for the music concert.",
  category: "Music",
  venue: "Updated Bandaranayake Hall",
  startDate: "2025-11-08",
  startTime: "17:00",
  endDate: "2025-11-08",
  endTime: "21:00",
  participantsCount: 150,
  isApproved: true,
  organizationId: "OC1234"
};

module.exports = {
  eventData,
  invalidTitles,
  invalidDescriptions,
  invalidCategories,
  invalidVenues,
  invalidStartDates,
  invalidStartTimes,
  invalidEndDates,
  invalidEndTimes,
  invalidParticipantsCounts,
  missingFieldTests,
  invalidFieldTests,
  multipleEventsData,
  updateEventData,
};
