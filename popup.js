document.addEventListener('DOMContentLoaded', () => {
  const calcBtn = document.getElementById('calcBtn');
  const statusEl = document.getElementById('status');
  
  // Auto-calculate on open
  calculateMarks();

  document.getElementById('authorLink').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.linkedin.com/in/2k3manu/' });
  });

  document.getElementById('uucmsLink').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://uucms.karnataka.gov.in' });
  });

  calcBtn.addEventListener('click', () => {
    calculateMarks();
  });

  function calculateMarks() {
    statusEl.textContent = 'Scanning...';
    hideError();
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (!tabs[0].id) return;

      chrome.tabs.sendMessage(tabs[0].id, {action: "EXTRACT_MARKS"}, (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          showError();
          return;
        }

        if (response && response.success) {
          updateUI(response.data);
          statusEl.textContent = 'Success';
        }
      });
    });
  }

  function showError() {
    statusEl.textContent = 'Not Found';
    document.querySelector('.stats-grid').style.display = 'none';
    document.getElementById('calcBtn').style.display = 'none';
    document.getElementById('errorMsg').style.display = 'block';
  }

  function hideError() {
    document.querySelector('.stats-grid').style.display = 'grid';
    document.getElementById('calcBtn').style.display = 'block';
    document.getElementById('errorMsg').style.display = 'none';
  }

  function updateUI(data) {
    const totalEl = document.getElementById('totalMarks');
    const maxEl = document.getElementById('maxMarks');
    const avgEl = document.getElementById('averageMarks');
    const pctEl = document.getElementById('percentage');

    // Animate numbers
    animateValue(totalEl, 0, data.totalObtained, 1000);
    if (data.totalMax > 0) {
        maxEl.textContent = `/ ${data.totalMax}`;
    } else {
        maxEl.textContent = '';
    }
    
    animateValue(avgEl, 0, data.average, 1000, 1);
    animateValue(pctEl, 0, data.percentage, 1000, 1, '%');
  }

  function animateValue(obj, start, end, duration, decimals = 0, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = progress * (end - start) + start;
      obj.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
});
