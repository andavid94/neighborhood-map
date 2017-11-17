
var map, clientID, clientSecret;
var markers = [];


var listedLocations = [
        {title: 'Purple Cafe and Wine Bar', location: {lat: 47.608013, lng: -122.334981}},
        {title: 'FOB Poke Bar', location: {lat: 47.613767, lng: -122.343768}},
        {title: 'Molly Moon\'s Ice Cream', location: {lat: 47.615111, lng: -122.31977}},
        {title: 'Dick\'s Drive-In', location: {lat: 47.62349, lng: -122.356467}},
        {title: 'Shiro\'s Sushi', location: {lat: 47.614775, lng: -122.347429}},
        {title: 'Japonessa', location: {lat: 47.608006, lng: -122.339091}},
        {title: 'Portage Bay Cafe', location: {lat: 47.621843, lng: -122.337419}},
        {title: 'Serious Pie', location: {lat: 47.612903, lng: -122.340432}},
        {title: 'Space Needle', location: {lat: 47.620423, lng: -122.349355}},
        {title: 'Pike Place Market', location: {lat: 47.610136, lng: -122.342057}},
]; 


var LocationReference = function(data) {
    var self = this;

    this.title = ko.observable(data.title);
    this.position = ko.observable(data.location);
    this.lat = position.lat;
    this.lng = position.lng;
    this.isVisible = ko.observable(true);

    this.street = '';
    this.city = '';
    this.zip = '';

    var clientID = 'PMC5GCKLYGAHRMHVMQOGBDSSXCFP2XTR1GOFEKZTE4GUXS2U';
    var clientSecret = 'AKWMMZL1WRV0CC1XI0AMZBCNOH4ANRKW5B5WREYEXLLHSV5O';

    var foursquareUrl = 'https://api.foursquare.com/v2/venues/search?11=' + this.lat + ',' + this.lng + '&client_id=' + 
                          clientID + '&client_secret=' + clientSecret + '&v=20171116' + '&query=' + this.title;
    
    $.getJSON(foursquareUrl).done(function(data) {
      var response = data.response.venues[0];
      this.street = response.location.formattedAddress[0] ? response.location.formattedAddress[0]: 'N/A';
      this.city = response.location.formattedAddress[1] ? response.location.formattedAddress[1]: 'N/A';
      this.zip = response.location.formattedAddress[3] ? response.location.formattedAddress[3]: 'N/A';
    }).fail(function () {
      alert(
        "There was in issue with the Foursquare API"
      );
    });

}; 


function initMap() {
    var styles = [
          {
            featureType: 'water',
            stylers: [
              { color: '#66ccff' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          }
    ];

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 47.616484, lng: -122.336774},
        zoom: 14,
        styles: styles,
        mapTypeControl: false
    });

    var defaultIcon = makeMarkerIcon('3399ff');
    var highlightedIcon = makeMarkerIcon('336600');

    this.largeInfoWindow = new google.maps.InfoWindow();

    for (var i = 0; i < listedLocations.length; i++) {
        var position = listedLocations[i].location;
        var title = listedLocations[i].title;
        
        this.marker = new google.maps.Marker({
            position: position,
            lat: position.lat,
            lng: position.lng,
            title: title,
            map: map,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP
        });

        this.markers.push(this.marker);

        this.marker.addListener('click', function() {
            populateInfoWindow(this, largeInfoWindow, this.street, this.city, this.zip);
        });

        this.marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });

        this.marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
    }

    var bounds = new google.maps.LatLngBounds();
    
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }

    map.fitBounds(bounds);
}


var ViewModel = function() {
    var self = this; 

    this.markers = ko.observableArray([]);

    listedLocations.forEach(function(locationItem) {
        self.markers.push( new LocationReference(locationItem));
    });
    
};

function populateInfoWindow(marker, infowindow, street, city, zip) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          var infowindowContent = '<h4>' + marker.title + '</h4>' + '<p>' + marker.street + 
                                  '<br>' + marker.city + '<br>' + marker.zip + '</p>';
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          var getStreetView = function(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent(infowindowContent + '<div id="pano"></div>');
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
              infowindow.setContent(infowindowContent + 
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

function makeMarkerIcon(markerColor) {
    var image = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
    return image;
}

ko.applyBindings(new ViewModel());



