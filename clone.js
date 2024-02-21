
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

const minLat = 20.9975;
const maxLat = 21.0509;
const minLong = 105.7881;
const maxLong = 105.9043;


async function getData(url) {
  return fetch(url)
    .then(response => response.json())
    .catch(error => console.log(error));
}


function initialize() {
  check_count = 0;
  disableButton('check');
  if (accumulated_distance == 0) {
    document.getElementById("totaldistance").innerHTML = 'Round Score: 0 Miles';
  }
  document.getElementById("location").innerHTML = ' ';
  document.getElementById("distance").innerHTML = ' ';

  var lat = (Math.random() * (maxLat - minLat) + minLat);
  var long = (Math.random() * (maxLong - minLong) + minLong);

  var streetviewService = new google.maps.StreetViewService();
  streetviewService.getPanoramaByLocation(new google.maps.LatLng(lat, long), 50,
    function (data, status) {
      if (status == google.maps.StreetViewStatus.OK) {

      }
      else { location.reload(); }
    }
  );


  true_location.push(lat, long);
  current_name = ("VIET NAM");


  var luther = { lat: 21.0228148, lng: 105.7957638 };

  var map = new google.maps.Map(document.getElementById('map'), {
    center: luther,
    zoom: 12,
    streetViewControl: false,
    gestureHandling: 'greedy'
  });

  var rmap = new google.maps.Map(document.getElementById('result'), {
    center: { lat: lat, lng: long },
    zoom: 12,
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER
    },
    gestureHandling: 'greedy'
  });


  google.maps.event.addListener(map, 'click', function (event) {
    placeMarker(event.latLng);
    if (check_count == 0) {
      enableButton('check');
      check_count += 1;
    }
  });

  function placeMarker(location) {
    deleteMarkers();
    guess_coordinates = [];
    var marker = new google.maps.Marker({
      position: location,
      map: map,
    });
    markers.push(marker);
    guess_coordinates.push(marker.getPosition().lat(), marker.getPosition().lng());
  }


  var panorama = new google.maps.StreetViewPanorama(
    document.getElementById('pano'), {
    position: { lat: lat, lng: long },
    pov: {
      heading: 180,
      pitch: 10
    },
    zoom: 1,
    preference: google.maps.StreetViewPreference.NEAREST,
    radius: 5000,
    addressControl: false
  });
  map.setStreetView(panorama);

}

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function clearMarkers() {
  setMapOnAll(null);
}

function showMarkers() {
  setMapOnAll(map);
}

function deleteMarkers() {
  clearMarkers();
  markers = [];
}

function continueGame() {
  var resModal = new bootstrap.Modal(document.getElementById('resultModal'));
  resModal.hide();
  location.reload();
}

function check() {
  var resModal = new bootstrap.Modal(document.getElementById('resultModal'));
  resModal.show();
  distance_from_guess = [];
  var guess_error = (distance(guess_coordinates[0], guess_coordinates[1], true_location[0], true_location[1], 'M'));
  accumulated_distance += parseFloat(guess_error);
  distance_from_guess = guess_error;

  var true_coords = { lat: true_location[0], lng: true_location[1] };
  var guess_coords = { lat: guess_coordinates[0], lng: guess_coordinates[1] };


  var result_map = new google.maps.Map(document.getElementById('result'), {
    zoom: 12,
    center: true_coords
  });

  var true_marker = new google.maps.Marker({
    position: true_coords,
    map: result_map,
    title: 'True Location',
    icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
    }
  });
  var infoWindow = new google.maps.InfoWindow({
    content: current_name
  })

  true_marker.addListener('click', function () {
    infoWindow.open(result_map, true_marker);
  });

  var guess_marker = new google.maps.Marker({
    position: guess_coords,
    map: result_map,
    title: 'Guessing Location',
    icon: {
      url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
    }
  });

  var flightPlanCoordinates = [
    true_coords, guess_coords,

  ];
  var lineSymbol = {
    path: 'M 0,-1 0,1',
    strokeOpacity: 1,
    scale: 2
  };

  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    strokeOpacity: 0,
    icons: [{
      icon: lineSymbol,
      offset: '1',
      repeat: '15px'
    }],
  });

  flightPath.setMap(result_map);
  display_location();
  disableButton('check');
}

function distance(lat1, lon1, lat2, lon2, unit) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
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

    if (unit == "K") {
      dist = dist * 1.609344;
    }

    if (unit == "N") {
      dist = dist * 0.8684;
    }

    // Convert miles to meters
    dist = dist * 1609.34;

    return dist.toFixed(1);
  }
}


function display_location() {
  document.getElementById("score").innerHTML = "Congratulation! Your distance is " + distance_from_guess + "m away.";
}

function disableButton(id) {
  document.getElementById(id).disabled = true;
}

function enableButton(id) {
  document.getElementById(id).disabled = false;
}


