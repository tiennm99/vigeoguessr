'use strict';

var map;
var resultmap;
var markers = [];
var guess_coordinates = [];
var true_location = [];
var accumulated_distance = 0x0;
var current_name = '';
var distance_from_guess = [];
var check_count = 0x0;
var choiceLocation = 'HN';
const boundingBoxVN = {
  'HN': [105.77, 20.96, 105.88, 21.05, 0.003],
  'TPHCM': [106.62, 10.71, 106.75, 10.83, 0.005],
  'HP': [106.65, 20.8, 106.75, 20.9, 0.05],
  'ND': [0x6a, 20.35, 106.25, 20.5, 0.005],
  'DN': [108.17, 0x10, 108.25, 16.1, 0.005],
  'DL': [108.38, 11.89, 108.50, 12.00, 0.005],
  'DHLA': [106.35, 10.85, 106.45, 10.95, 0.005]
};
var minLat = boundingBoxVN[choiceLocation][0x1];
var maxLat = boundingBoxVN[choiceLocation][0x3];
var minLong = boundingBoxVN[choiceLocation][0x0];
var maxLong = boundingBoxVN[choiceLocation][0x2];
var delta = boundingBoxVN[choiceLocation][0x4];
async function getRandomMapillaryImage() {
  const _0x1e5b33 = Math.random() * (maxLat - minLat) + minLat;
  const _0x211128 = Math.random() * (maxLong - minLong) + minLong;
  const _0x2454d8 = [(_0x211128 - delta).toFixed(0x4), (_0x1e5b33 - delta).toFixed(0x4), (_0x211128 + delta).toFixed(0x4), (_0x1e5b33 + delta).toFixed(0x4)].join(',');
  const _0x514f4a = "https://graph.mapillary.com/images?access_token=MLY|24113623194974280|5bf83fa202912f1cc3210b2cf968fb65&fields=id,thumb_original_url,geometry,is_pano&limit=3&bbox=" + _0x2454d8 + '&is_pano=true';
  try {
    console.log("Fetching panoramic image...");
    const _0x36adbf = await fetch(_0x514f4a);
    const _0x5e2489 = await _0x36adbf.json();
    if (_0x5e2489.data && _0x5e2489.data.length > 0x0) {
      const _0x20dd30 = _0x5e2489.data.filter(_0x5bcfd5 => _0x5bcfd5.is_pano);
      const _0x2e6a28 = _0x20dd30.length > 0x0 ? _0x20dd30[Math.floor(Math.random() * _0x20dd30.length)] : _0x5e2489.data[0x0];
      console.log("Image fetched successfully");
      return {
        'lat': _0x2e6a28.geometry.coordinates[0x1],
        'lng': _0x2e6a28.geometry.coordinates[0x0],
        'url': _0x2e6a28.thumb_original_url,
        'id': _0x2e6a28.id,
        'isPano': _0x2e6a28.is_pano || false
      };
    } else {
      console.log("No images found, retrying...");
      return getRandomMapillaryImage();
    }
  } catch (_0x498c14) {
    console.error("Error fetching image:", _0x498c14);
    document.getElementById("pano").innerHTML = "\n      <div style=\"width:100%; height:400px; display:flex; justify-content:center; align-items:center; \">\n        <div style=\"text-align:center; color: #e74c3c;\">\n          <div style=\"font-size: 18px; margin-bottom: 10px;\">⚠️ Error loading image</div>\n          <div style=\"font-size: 14px;\">Retrying...</div>\n        </div>\n      </div>\n    ";
    setTimeout(() => getRandomMapillaryImage(), 0x7d0);
  }
}
function checkLibrariesLoaded() {
  return new Promise(_0x5b45ac => {
    const _0x53b944 = setInterval(() => {
      if (window.L && window.PhotoSphereViewer) {
        clearInterval(_0x53b944);
        _0x5b45ac();
      }
    }, 0x64);
  });
}
function showLoading() {
  document.getElementById("pano").innerHTML = "\n    <div style=\"width:100%; height:400px; display:flex; justify-content:center; align-items:center; \">\n      <div style=\"text-align:center;\">\n        <div style=\"border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto 15px;\"></div>\n        <div style=\"color: #666; font-size: 16px;\">Loading image...</div>\n      </div>\n    </div>\n  ";
  if (!document.getElementById('loading-styles')) {
    const _0x54e63f = document.createElement("style");
    _0x54e63f.id = "loading-styles";
    _0x54e63f.textContent = "\n      @keyframes spin {\n        0% { transform: rotate(0deg); }\n        100% { transform: rotate(360deg); }\n      }\n    ";
    document.head.appendChild(_0x54e63f);
  }
}
function hideLoading() {
  const _0x336799 = document.getElementById("pano");
  if (_0x336799 && _0x336799.innerHTML.includes("Loading image...")) {
    _0x336799.innerHTML = '';
  }
}
function initialize() {
  check_count = 0x0;
  disableButton("check");
  showLoading();
  getRandomMapillaryImage().then(_0x322477 => {
    if (!_0x322477) {
      return location.reload();
    }
    true_location = [_0x322477.lat, _0x322477.lng];
    current_name = "VIET NAM";
    document.getElementById("pano").innerHTML = '';
    try {
      if (window.PhotoSphereViewer && window.PhotoSphereViewer.Viewer) {
        hideLoading();
        const _0x106e35 = new PhotoSphereViewer.Viewer({
          'container': document.getElementById("pano"),
          'panorama': _0x322477.url,
          'loadingImg': null,
          'defaultYaw': 0x0,
          'defaultZoomLvl': -0x60,
          'navbar': ["zoom", "fullscreen"],
          'mousewheel': true,
          'touchmoveTwoFingers': true
        });
        _0x106e35.addEventListener('ready', () => {
          console.log("Photo Sphere Viewer loaded successfully");
        });
        _0x106e35.addEventListener("panorama-loaded", () => {
          console.log("Panorama image loaded");
        });
        _0x106e35.addEventListener('panorama-error', _0x1c0c5c => {
          console.error("Error loading panorama:", _0x1c0c5c);
          hideLoading();
          document.getElementById('pano').innerHTML = "<img src=\"" + _0x322477.url + "\" style=\"width:100%; height:100%; object-fit:cover; border-radius:10px;\" />";
        });
      } else {
        console.warn("PhotoSphereViewer not available, using fallback image");
        hideLoading();
        document.getElementById('pano').innerHTML = "<img src=\"" + _0x322477.url + "\" style=\"width:100%; height:100%; object-fit:cover; border-radius:10px;\" />";
      }
    } catch (_0x5772f5) {
      console.error("Error initializing Photo Sphere Viewer:", _0x5772f5);
      hideLoading();
      document.getElementById("pano").innerHTML = "<img src=\"" + _0x322477.url + "\" style=\"width:100%; height:100%; object-fit:cover; border-radius:10px;\" />";
    }
    map = L.map("map").setView([(minLat + maxLat) / 0x2, (minLong + maxLong) / 0x2], 0xa);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      'maxZoom': 0x13
    }).addTo(map);
    map.on('click', function (_0x40567a) {
      deleteMarkers();
      guess_coordinates = [_0x40567a.latlng.lat, _0x40567a.latlng.lng];
      const _0x4c4f9b = L.marker(_0x40567a.latlng).addTo(map);
      markers.push(_0x4c4f9b);
      if (check_count === 0x0) {
        enableButton("check");
        check_count += 0x1;
      }
    });
  })["catch"](_0x59af69 => {
    console.error("Error in initialize function:", _0x59af69);
    document.getElementById("pano").innerHTML = "\n      <div style=\"width:100%; height:400px; display:flex; justify-content:center; align-items:center;\">\n        <div style=\"text-align:center; color: #e74c3c;\">\n          <div style=\"font-size: 18px; margin-bottom: 10px;\">⚠️ Failed to load</div>\n          <button onclick=\"location.reload()\" style=\"padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;\">Retry</button>\n        </div>\n      </div>\n    ";
  });
}
function clearMarkers() {
  for (let _0x172f86 = 0x0; _0x172f86 < markers.length; _0x172f86++) {
    map.removeLayer(markers[_0x172f86]);
  }
  markers = [];
}
function deleteMarkers() {
  clearMarkers();
}
function continueGame() {
  var _0x4e74e6 = new bootstrap.Modal(document.getElementById("resultModal"));
  _0x4e74e6.hide();
  location.reload();
}
function check() {
  distance_from_guess = [];
  var _0x1625f4 = distance(guess_coordinates[0x0], guess_coordinates[0x1], true_location[0x0], true_location[0x1], 'M');
  accumulated_distance += parseFloat(_0x1625f4);
  distance_from_guess = _0x1625f4;
  showResultModal(distance_from_guess);
  disableButton("check");
}
function distance(_0x17d630, _0x124646, _0x3a8477, _0x8b4b7c, _0x1a420b) {
  if (_0x17d630 == _0x3a8477 && _0x124646 == _0x8b4b7c) {
    return 0x0;
  } else {
    var _0x197d3c = Math.PI * _0x17d630 / 0xb4;
    var _0x24a9f1 = Math.PI * _0x3a8477 / 0xb4;
    var _0x50ac69 = _0x124646 - _0x8b4b7c;
    var _0x9d3f4f = Math.PI * _0x50ac69 / 0xb4;
    var _0xc2f51b = Math.sin(_0x197d3c) * Math.sin(_0x24a9f1) + Math.cos(_0x197d3c) * Math.cos(_0x24a9f1) * Math.cos(_0x9d3f4f);
    if (_0xc2f51b > 0x1) {
      _0xc2f51b = 0x1;
    }
    _0xc2f51b = Math.acos(_0xc2f51b);
    _0xc2f51b = _0xc2f51b * 0xb4 / Math.PI;
    _0xc2f51b = _0xc2f51b * 0x3c * 1.1515;
    if (_0x1a420b == 'K') {
      _0xc2f51b = _0xc2f51b * 1.609344;
    }
    if (_0x1a420b == 'N') {
      _0xc2f51b = _0xc2f51b * 0.8684;
    }
    _0xc2f51b = _0xc2f51b * 1609.34;
    return _0xc2f51b.toFixed(0x1);
  }
}
function display_location() {
  const _0x525f5a = document.getElementById("score");
  if (distance_from_guess > 0x3e8) {
    _0x525f5a.innerHTML = "Hmm! Your distance is " + distance_from_guess + "m away.";
  } else {
    if (distance_from_guess > 0xc8) {
      _0x525f5a.innerHTML = "Good job! Your distance is " + distance_from_guess + "m away.";
    } else {
      _0x525f5a.innerHTML = "Excellent! Your distance is " + distance_from_guess + "m away.";
    }
  }
}
function disableButton(_0x192b3e) {
  document.getElementById(_0x192b3e).disabled = true;
}
function enableButton(_0x9b2383) {
  document.getElementById(_0x9b2383).disabled = false;
}
function showResultModal(_0x6a4c37) {
  const _0x282e45 = document.getElementById('resultModal');
  const _0x2868ea = document.getElementById("resultText");
  const _0x545279 = document.getElementById('distance-guess');
  if (distance_from_guess > 0x3e8) {
    _0x545279.innerHTML = (distance_from_guess / 0x3e8).toFixed(0x2) + " KM";
  } else {
    _0x545279.innerHTML = distance_from_guess + " M";
  }
  if (distance_from_guess > 0x3e8) {
    _0x2868ea.innerHTML = "Hmm! Nice try.";
  } else {
    if (distance_from_guess > 0xc8) {
      _0x2868ea.innerHTML = "Good job!";
    } else {
      _0x2868ea.innerHTML = "Excellent!";
    }
  }
  _0x282e45.style.display = "block";
  createResultMap();
}
function createResultMap() {
  const _0x30d8e9 = document.getElementById("result");
  _0x30d8e9.innerHTML = '';
  var _0x47b24a = L.map("result").setView(true_location, 0xc);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    'maxZoom': 0x13
  }).addTo(_0x47b24a);
  setTimeout(() => {
    _0x47b24a.invalidateSize();
  }, 0x64);
  const _0x2ca010 = L.marker(true_location, {
    'icon': L.icon({
      'iconUrl': "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
      'iconSize': [0x20, 0x20]
    })
  }).addTo(_0x47b24a).bindPopup(current_name);
  const _0x1d678a = L.marker(guess_coordinates, {
    'icon': L.icon({
      'iconUrl': "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      'iconSize': [0x20, 0x20]
    })
  }).addTo(_0x47b24a).bindPopup("Your Guess");
  const _0x28ce52 = new L.featureGroup([_0x2ca010, _0x1d678a]);
  _0x47b24a.fitBounds(_0x28ce52.getBounds().pad(0.1));
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
  const _0x571872 = document.getElementById("donateModal");
  _0x571872.style.display = "block";
}
function closeDonate() {
  const _0xb32e8c = document.getElementById("donateModal");
  _0xb32e8c.style.display = "none";
}
window.onload = function () {
  const _0x4e1bcd = new URLSearchParams(window.location.search);
  const _0x517d2e = _0x4e1bcd.get('location');
  if (_0x517d2e) {
    choiceLocation = _0x517d2e;
  }
  minLat = boundingBoxVN[choiceLocation][0x1];
  maxLat = boundingBoxVN[choiceLocation][0x3];
  minLong = boundingBoxVN[choiceLocation][0x0];
  maxLong = boundingBoxVN[choiceLocation][0x2];
  delta = boundingBoxVN[choiceLocation][0x4];
  checkLibrariesLoaded().then(() => {
    initialize();
  });
};
