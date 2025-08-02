'use strict';

var map;
var resultmap;
var markers = [];
var guess_coordinates = [];
var true_location = [];
var accumulated_distance = 0;
var current_name = '';
var distance_from_guess = [];
var check_count = 0;
var choiceLocation = 'HN';
const boundingBoxVN = {
  'HN': [105.77, 20.96, 105.88, 21.05, 0.003],
  'TPHCM': [106.62, 10.71, 106.75, 10.83, 0.005],
  'HP': [106.65, 20.8, 106.75, 20.9, 0.05],
  'ND': [106, 20.35, 106.25, 20.5, 0.005],
  'DN': [108.17, 16, 108.25, 16.1, 0.005],
  'DL': [108.38, 11.89, 108.50, 12.00, 0.005],
  'DHLA': [106.35, 10.85, 106.45, 10.95, 0.005]
};
var minLat = boundingBoxVN[choiceLocation][1];
var maxLat = boundingBoxVN[choiceLocation][3];
var minLong = boundingBoxVN[choiceLocation][0];
var maxLong = boundingBoxVN[choiceLocation][2];
var delta = boundingBoxVN[choiceLocation][4];

async function getRandomMapillaryImage() {
  const randomLat = Math.random() * (maxLat - minLat) + minLat;
  const randomLng = Math.random() * (maxLong - minLong) + minLong;
  const bbox = [(randomLng - delta).toFixed(4), (randomLat - delta).toFixed(4), (randomLng + delta).toFixed(4), (randomLat + delta).toFixed(4)].join(',');
  const apiUrl = "https://graph.mapillary.com/images?access_token=MLY|24113623194974280|5bf83fa202912f1cc3210b2cf968fb65&fields=id,thumb_original_url,geometry,is_pano&limit=3&bbox=" + bbox + '&is_pano=true';
  try {
    console.log("Fetching panoramic image...");
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const panoImages = data.data.filter(image => image.is_pano);
      const selectedImage = panoImages.length > 0 ? panoImages[Math.floor(Math.random() * panoImages.length)] : data.data[0];
      console.log("Image fetched successfully");
      return {
        'lat': selectedImage.geometry.coordinates[1],
        'lng': selectedImage.geometry.coordinates[0],
        'url': selectedImage.thumb_original_url,
        'id': selectedImage.id,
        'isPano': selectedImage.is_pano || false
      };
    } else {
      console.log("No images found, retrying...");
      return getRandomMapillaryImage();
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    document.getElementById("pano").innerHTML = `
      <div style="width:100%; height:400px; display:flex; justify-content:center; align-items:center; ">
        <div style="text-align:center; color: #e74c3c;">
          <div style="font-size: 18px; margin-bottom: 10px;">⚠️ Error loading image</div>
          <div style="font-size: 14px;">Retrying...</div>
        </div>
      </div>
    `;
    setTimeout(() => getRandomMapillaryImage(), 2000);
  }
}

function checkLibrariesLoaded() {
  return new Promise(resolve => {
    const checkInterval = setInterval(() => {
      if (window.L && window.PhotoSphereViewer) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
}

function showLoading() {
  document.getElementById("pano").innerHTML = `
    <div style="width:100%; height:400px; display:flex; justify-content:center; align-items:center; ">
      <div style="text-align:center;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto 15px;"></div>
        <div style="color: #666; font-size: 16px;">Loading image...</div>
      </div>
    </div>
  `;
  if (!document.getElementById('loading-styles')) {
    const styleElement = document.createElement("style");
    styleElement.id = "loading-styles";
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleElement);
  }
}

function hideLoading() {
  const panoElement = document.getElementById("pano");
  if (panoElement && panoElement.innerHTML.includes("Loading image...")) {
    panoElement.innerHTML = '';
  }
}

function initialize() {
  check_count = 0;
  disableButton("check");
  showLoading();
  getRandomMapillaryImage().then(imageData => {
    if (!imageData) {
      return location.reload();
    }
    true_location = [imageData.lat, imageData.lng];
    current_name = "VIET NAM";
    document.getElementById("pano").innerHTML = '';
    try {
      if (window.PhotoSphereViewer && window.PhotoSphereViewer.Viewer) {
        hideLoading();
        const viewer = new PhotoSphereViewer.Viewer({
          'container': document.getElementById("pano"),
          'panorama': imageData.url,
          'loadingImg': null,
          'defaultYaw': 0,
          'defaultZoomLvl': -60,
          'navbar': ["zoom", "fullscreen"],
          'mousewheel': true,
          'touchmoveTwoFingers': true
        });
        viewer.addEventListener('ready', () => {
          console.log("Photo Sphere Viewer loaded successfully");
        });
        viewer.addEventListener("panorama-loaded", () => {
          console.log("Panorama image loaded");
        });
        viewer.addEventListener('panorama-error', error => {
          console.error("Error loading panorama:", error);
          hideLoading();
          document.getElementById('pano').innerHTML = `<img src="${imageData.url}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;" />`;
        });
      } else {
        console.warn("PhotoSphereViewer not available, using fallback image");
        hideLoading();
        document.getElementById('pano').innerHTML = `<img src="${imageData.url}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;" />`;
      }
    } catch (error) {
      console.error("Error initializing Photo Sphere Viewer:", error);
      hideLoading();
      document.getElementById("pano").innerHTML = `<img src="${imageData.url}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;" />`;
    }
    map = L.map("map").setView([(minLat + maxLat) / 2, (minLong + maxLong) / 2], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      'maxZoom': 19
    }).addTo(map);
    map.on('click', function (event) {
      deleteMarkers();
      guess_coordinates = [event.latlng.lat, event.latlng.lng];
      const marker = L.marker(event.latlng).addTo(map);
      markers.push(marker);
      if (check_count === 0) {
        enableButton("check");
        check_count += 1;
      }
    });
  })["catch"](error => {
    console.error("Error in initialize function:", error);
    document.getElementById("pano").innerHTML = `
      <div style="width:100%; height:400px; display:flex; justify-content:center; align-items:center;">
        <div style="text-align:center; color: #e74c3c;">
          <div style="font-size: 18px; margin-bottom: 10px;">⚠️ Failed to load</div>
          <button onclick="location.reload()" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
        </div>
      </div>
    `;
  });
}

function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    map.removeLayer(markers[i]);
  }
  markers = [];
}

function deleteMarkers() {
  clearMarkers();
}

function continueGame() {
  var resultModal = new bootstrap.Modal(document.getElementById("resultModal"));
  resultModal.hide();
  location.reload();
}

function check() {
  distance_from_guess = [];
  var distanceInMeters = distance(guess_coordinates[0], guess_coordinates[1], true_location[0], true_location[1], 'M');
  accumulated_distance += parseFloat(distanceInMeters);
  distance_from_guess = distanceInMeters;
  showResultModal(distance_from_guess);
  disableButton("check");
}

function distance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == 'K') {
      dist = dist * 1.609344;
    }
    if (unit == 'N') {
      dist = dist * 0.8684;
    }
    dist = dist * 1609.34;
    return dist.toFixed(1);
  }
}

function display_location() {
  const scoreElement = document.getElementById("score");
  if (distance_from_guess > 1000) {
    scoreElement.innerHTML = "Hmm! Your distance is " + distance_from_guess + "m away.";
  } else {
    if (distance_from_guess > 200) {
      scoreElement.innerHTML = "Good job! Your distance is " + distance_from_guess + "m away.";
    } else {
      scoreElement.innerHTML = "Excellent! Your distance is " + distance_from_guess + "m away.";
    }
  }
}

function disableButton(buttonId) {
  document.getElementById(buttonId).disabled = true;
}

function enableButton(buttonId) {
  document.getElementById(buttonId).disabled = false;
}

function showResultModal(distance) {
  const resultModalElement = document.getElementById('resultModal');
  const resultTextElement = document.getElementById("resultText");
  const distanceGuessElement = document.getElementById('distance-guess');
  if (distance_from_guess > 1000) {
    distanceGuessElement.innerHTML = (distance_from_guess / 1000).toFixed(2) + " KM";
  } else {
    distanceGuessElement.innerHTML = distance_from_guess + " M";
  }
  if (distance_from_guess > 1000) {
    resultTextElement.innerHTML = "Hmm! Nice try.";
  } else {
    if (distance_from_guess > 200) {
      resultTextElement.innerHTML = "Good job!";
    } else {
      resultTextElement.innerHTML = "Excellent!";
    }
  }
  resultModalElement.style.display = "block";
  createResultMap();
}

function createResultMap() {
  const resultMapElement = document.getElementById("result");
  resultMapElement.innerHTML = '';
  var resultMapObj = L.map("result").setView(true_location, 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    'maxZoom': 19
  }).addTo(resultMapObj);
  setTimeout(() => {
    resultMapObj.invalidateSize();
  }, 100);
  const trueLocationMarker = L.marker(true_location, {
    'icon': L.icon({
      'iconUrl': "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
      'iconSize': [32, 32]
    })
  }).addTo(resultMapObj).bindPopup(current_name);
  const guessMarker = L.marker(guess_coordinates, {
    'icon': L.icon({
      'iconUrl': "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      'iconSize': [32, 32]
    })
  }).addTo(resultMapObj).bindPopup("Your Guess");
  const featureGroup = new L.featureGroup([trueLocationMarker, guessMarker]);
  resultMapObj.fitBounds(featureGroup.getBounds().pad(0.1));

  L.polyline([true_location, guess_coordinates], { color: 'blue' }).addTo(resultMapObj);
}

function closeResultModal() {
  document.getElementById('resultModal').style.display = "none";
}

function nextRound() {
  closeResultModal();
  location.reload();
}

function goBack() {
  window.location.href = '/';
}

function showDonateModal() {
  const donateModal = document.getElementById("donateModal");
  donateModal.style.display = "block";
}

function closeDonate() {
  const donateModal = document.getElementById("donateModal");
  donateModal.style.display = "none";
}

window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const locationParam = urlParams.get('location');
  if (locationParam) {
    choiceLocation = locationParam;
  }
  minLat = boundingBoxVN[choiceLocation][1];
  maxLat = boundingBoxVN[choiceLocation][3];
  minLong = boundingBoxVN[choiceLocation][0];
  maxLong = boundingBoxVN[choiceLocation][2];
  delta = boundingBoxVN[choiceLocation][4];
  checkLibrariesLoaded().then(() => {
    initialize();
  });
};
