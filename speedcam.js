/*Using Revealing Module Pattern to use private/public functions - Alternative: Module Pattern */
var map = (function () {

	/*Google Maps API defaults*/
	var initMap = {
		zoom:11,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};

	/*Statics*/
	var static = {
		JSON_PATH:'speedcam.php',
		IMAGE_PATH:'images/',
		MY_POS_TITLE:'Aktueller Standort'
	};

	/*Globals*/
	var map, //*Reference to map object
		myLat, //*Current latitude
		myLng, //*Current longitude
		myLatLng, //*Current position (lat+lng)
		myPosMarker, //Reference to current position marker
		speedcamMarker = [], //Array with all speedcam
		speedcamTyp = {};    //Array with all speedcam types


	/*Init map, get initial speedcam Types and attach to DOM node*/
	var m_init = function (node) {

		/*Get Overlay types one time on init, then init map */
		m_getSpeedcamTyp(function () {
			map = new google.maps.Map(node, initMap);
		});
	};

	/*Returns JSON with all types of speedcams*/
	var m_getSpeedcamTyp = function (callback) {

		$.getJSON(static.JSON_PATH + "?m=getTyp", function (json) {
			$.each(json, function (index, typ) {
				speedcamTyp[typ.id] = typ;
			});
			callback.call(this, speedcamTyp);
		});
	};

	/*Clean speedcam markers*/
	var m_clearMarkers = function () {

		for (var i in speedcamMarker) {
			speedcamMarker[i].setMap(null);
		}
	};

	/*Redraw map on size/orientation change*/
	var m_resizeMap = function () {
		google.maps.event.trigger(map, 'resize');
	};

	/*Center map to current position*/
	var m_centerMap = function () {
		map.setCenter(myLatLng);
	};

	/*Returns JSON with all Speedcams in specific distance*/
	var m_getSpeedcam = function (dist) {

		/*Remove old markers from last request*/
		m_clearMarkers();

		$.getJSON(static.JSON_PATH + "?lat=" + myLat + "&lng=" + myLng + "&dist=" + dist, function (json) {

			$.each(json, function (index, speedcam) {

				var myLatLng = new google.maps.LatLng(speedcam.lat, speedcam.lng);
				speedcamMarker[index] = new google.maps.Marker({
					position:myLatLng,
					map:map,
					title:speedcamTyp[speedcam.typId].typ,
					icon:static.IMAGE_PATH + speedcamTyp[speedcam.typId].icon
				});
			});
		});
	};

	/*Adds new Speedcam to Database*/
	var m_setSpeedcam = function (typid, callback) {
		$.getJSON(static.JSON_PATH + "?m=add&typid=" + typid + "&lat=" + myLat + "&lng=" + myLng + "&dist=1", function (json) {

			/*Remove old markers from last request*/
			m_clearMarkers();

			speedcamMarker[0] = new google.maps.Marker({
				position:myLatLng,
				map:map,
				title:speedcamTyp[json[0].typId].typ,
				icon:static.IMAGE_PATH + speedcamTyp[json[0].typId].icon
			});
			callback.call(this);
		});
	};

	/*Request current location using HTML5 geolocation*/
	var m_getLocByGeo = function (callback) {

		/*Remove old Position*/
		if (myPosMarker) myPosMarker.setMap(null);

		if (navigator.geolocation) {

			navigator.geolocation.getCurrentPosition(function (position) {
				myLat = position.coords.latitude;
				myLng = position.coords.longitude;
				myLatLng = new google.maps.LatLng(myLat, myLng);

				myPosMarker = new google.maps.Marker({
					position:myLatLng,
					map:map,
					title:static.MY_POS_TITLE
				});

				callback.call(this);

			}, function (error) {
				console.log("Geocode was not successful for the following reason: " + error);
			});
		} else {
			console.log('Browser not Supported');
		}
	};

	/*Request current location using Google's address lookup API*/
	var m_getLocByAddress = function (adr, callback) {

		/*Remove old Position*/
		if (myPosMarker) myPosMarker.setMap(null);

		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ 'address':adr}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {

				myLat = results[0].geometry.location.lat();
				myLng = results[0].geometry.location.lng();
				myLatLng = new google.maps.LatLng(myLat, myLng);

				myPosMarker = new google.maps.Marker({
					map:map,
					position:results[0].geometry.location
				});
				callback.call(this);
			} else {
				console.log("Geocode was not successful for the following reason: " + status);
			}
		});
	};

	// Return public functions
	return{
		init:m_init,
		resizeMap:m_resizeMap,
		centerMap:m_centerMap,
		setSpeedcam:m_setSpeedcam,
		getSpeedcam:m_getSpeedcam,
		getSpeedcamTyp:m_getSpeedcamTyp,
		getLocByGeo:m_getLocByGeo,
		getLocByAddress:m_getLocByAddress
	};
})();