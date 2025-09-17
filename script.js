const getIpBtn = document.getElementById('get-ip-btn');
const resultBox = document.getElementById('result-box');
const CACHE_TIMEOUT = 60 * 10 * 1000;

function showToast(m, d = 5) {
  Toastify({
    text: m,
    duration: d * 1000,
  }).showToast();
}

// Public API endpoint
const API_ENDPOINT = 'https://ipapi.co/json/';

function render( data ) {
  Object.keys(data).forEach(k => {
    if (!data[k]) return;

    const detailItem = document.createElement("div");
    detailItem.classList.add("detail-item");

    const label = document.createElement("span");
    label.classList.add("label");
    label.textContent = k.toUpperCase();

    const value = document.createElement("span");
    value.classList.add("value");
    value.textContent = data[k] || 'N/A';

    detailItem.appendChild(label)
    detailItem.appendChild(value)
    resultBox.appendChild(detailItem);
  });

  // Display the results and a success message
  resultBox.style.display = 'flex';

  hideIpButton();
}

function getFromCache() {
  let data = JSON.parse(sessionStorage.getItem( "ip-info" ));
  if ( data && (Date.now() - data.fetchedAt) < CACHE_TIMEOUT ) {
    showToast( "Fetched from cache.")
    return data.info;
  }
  return null
}

async function getIpAddress() {
  resultBox.style.display = 'none';
  getIpBtn.style.display = "none";

  resultBox.querySelectorAll("div").forEach( d => d.remove() );

  let d = getFromCache();
  if ( d ) {
    return render( d );
  }

  try {
    showToast('Fetching IP address...');
    const response = await fetch(API_ENDPOINT);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Check for common API errors
    if (data.error) {
      throw new Error(data.reason);
    }

    sessionStorage.setItem("ip-info", JSON.stringify({
      info: data,
      fetchedAt: Date.now()
    }))

    render( data );
    showToast('Information fetched.');

  } catch (error) {
    console.error('Error fetching IP information:', error);
    showToast(`Error: ${error.message}`);
  }
}

getIpBtn.addEventListener('click', getIpAddress);

let timer =  null;
function hideIpButton() {
  let counter = 120;
  getIpBtn.style.display = "none"
  timer = setInterval(() => {
    if ( counter <= 0 ) {
      clearInterval( timer );
      getIpBtn.style.display = "block"
    } else {
      --counter;
    }
  }, 1000);
}

getIpAddress();
