// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_MARKS") {
    const data = extractMarksFromPage();
    sendResponse({success: !!data, data: data});
  }
  return true;
});

function extractMarksFromPage() {
  // Strategy: Target the specific UUCMS structure
  // User specified: 8th <td> is obtained marks. 4th <td> appears to be max marks (100).
  
  const rows = document.querySelectorAll('tbody tr');
  if (!rows || rows.length === 0) return null;

  let totalObtained = 0;
  let totalMax = 0;
  let count = 0;

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    
    // Ensure we have enough cells (at least 8)
    if (cells.length < 8) return;

    // 4th column (index 3) = Max Marks
    // 8th column (index 7) = Obtained Marks
    
    const maxMarksStr = cells[3].innerText.trim();
    const obtainedMarksStr = cells[7].innerText.trim();

    const maxMarks = parseFloat(maxMarksStr);
    const obtainedMarks = parseFloat(obtainedMarksStr);

    if (!isNaN(maxMarks) && !isNaN(obtainedMarks)) {
      totalObtained += obtainedMarks;
      totalMax += maxMarks;
      count++;
    }
  });

  if (count === 0) return null;

  return {
    totalObtained,
    totalMax,
    average: count > 0 ? totalObtained / count : 0,
    percentage: totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
  };
}
