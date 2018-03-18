// In the following example, markers appear when the user clicks on the map.
// The markers are stored in an array.
// The user can then click an option to hide, show or delete the markers.
var map;
var markers = [];
var wishedMarkers = [];
var visitedMarkers = [];
var citiesInfo = [];

//Initialize map
function initMap() {
    var center = { lat: 49.838202, lng: 24.027335 };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: center,
        mapTypeId: 'terrain'
    });
    var geocoder = new google.maps.Geocoder;
    getAllCities();
    getAllVisitedCities();
    // This event listener will call addMarker() when the map is clicked.
    map.addListener('click', function (event) {
        addMarker(event.latLng, geocoder);
    });
}

//Delete specify city
function deleteCity(index) {
    var id = "#city" + index;
    markers[index].setMap(null);
    $(id).remove();
    delete citiesInfo[index];
    delete markers[index];
}

function setMapOnChosen(map) {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            markers[i].setMap(map);
        }
    }
}

function setMapOnWished(map) {
    for (var i = 0; i < wishedMarkers.length; i++) {
        if (wishedMarkers[i]) {
            wishedMarkers[i].setMap(map);
        }
    }
}

function setMapOnVisited(map) {
    for (var i = 0; i < visitedMarkers.length; i++) {
        if (visitedMarkers[i]) {
            visitedMarkers[i].setMap(map);
        }
    }
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + 'Some new text' + '</div><div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + "Some else text" + '</div>' +
                    '<div>No Street View Found</div>');
            }
        }
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnChosen(null);
    setMapOnWished(null);
    setMapOnVisited(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnChosen(map);
    setMapOnWished(map);
    setMapOnVisited(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    setMapOnChosen(null);
    $("div.city").remove();
    markers = [];
    citiesInfo = [];
}

function addMarker(location, geocoder) {
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    });
    markers.push(marker);
    var index = markers.indexOf(marker);
    showInfoWindows(marker);
    getCity(geocoder, marker, index);
}

function getCity(geocoder, marker, index) {
    var latlng = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
    geocoder.geocode({ 'location': latlng }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                var components = results[0].address_components;
                var city = null;
                for (var i = 0, component; component = components[i]; i++) {
                    if (!city) {
                        if (component.types[0] == 'locality') {
                            city = component['long_name'];
                            break;
                        }
                    }
                }
                var cityInfo = {
                    Name: city,
                    CoordLat: latlng.lat,
                    CoordLng: latlng.lng
                };
                citiesInfo.push(cityInfo);
                addToList(city, marker, index);
            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}

function addToList(city, marker, index) {
    var r = '<input class = "button pull-right" onclick="deleteCity(' + index + ');" type=button value="Delete">';
    var text = '<div id = "city' + index + '" class="list-group-item city">' + city + r + '</div>';
    $(text).appendTo('#list');
}

function addCities(cities) {
    $.ajax({
        url: '/Home/Add',
        type: 'POST',
        data: JSON.stringify(cities),
        dataType: 'json',
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            alert(data);
            $('.mvc-grid').mvcgrid('reload');
        },
        error: function (x, y, z) {
            alert(x + '\n' + y + '\n' + z);
        }
    });
}

function addition() {
    addCities(citiesInfo);
}

function getVisitedCity() {
    var ids = $('td.id').toArray();
    var checkboxes = document.getElementsByClassName('checkbox');
    var citiesChecked = []; 
    for (var index = 0; index < ids.length; index++) {
        if (checkboxes[index].checked) {
            var city = {
                Id: parseInt(ids[index].textContent),
                Visited: checkboxes[index].value
            };
            citiesChecked.push(city);
        }
    }
    if (citiesChecked.length) {
        console.log(citiesChecked);
        editCities(citiesChecked);
    }
}

function editCities(cities) {
    $.ajax({
        url: '/Home/Edit',
        type: 'POST',
        data: JSON.stringify(cities),
        dataType: 'json',
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            alert(data);
            $('.mvc-grid').mvcgrid('reload');
        },
        error: function (x, y, z) {
            alert(x + '\n' + y + '\n' + z);
        }
    });
}

function getAllCities() {
    $.ajax({
        url: '/Home/GetCoordinate',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            showWishedMarkers(data);
        },
        error: function (x, y, z) {
            alert("Тут ошибка" + '\n' + x + '\n' + y + '\n' + z);
        }
    });
}

function getAllVisitedCities() {
    $.ajax({
        url: '/Home/GetVisitedCoordinate',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            showVisitedMarkers(data);
        },
        error: function (x, y, z) {
            alert("Тут ошибка" + '\n' + x + '\n' + y + '\n' + z);
        }
    });
}

function showWishedMarkers(cities) {
    for (var i = 0; i < cities.length; i++) {
        var latLng = { lat: cities[i].CoordLat, lng: cities[i].CoordLng };
        console.log(latLng);
        var wishedMarker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
        showInfoWindows(wishedMarker);
        wishedMarkers.push(wishedMarker);
    }
}

function showVisitedMarkers(cities) {
    for (var i = 0; i < cities.length; i++) {
        var latLng = { lat: cities[i].CoordLat, lng: cities[i].CoordLng };
        var visitedMarker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
        showInfoWindows(visitedMarker);
        visitedMarkers.push(visitedMarker);
    }
}

function showInfoWindows(marker) {
    var largeInfowindow = new google.maps.InfoWindow();
    marker.addListener('click', function () {
        populateInfoWindow(this, largeInfowindow);
    });
}