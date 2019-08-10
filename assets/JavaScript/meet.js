// Variable Definitions
var latitude = '';
var longitude = '';
var coordsValue = false;
//EventBrite categories and Subcategories
var eventbriteCategories = [];
var eventbriteSubCategories = [];
//EventBrite URL to get categories and subcategories
var eventapiURL = "https://www.eventbriteapi.com/v3/"
var eventapiToken = "token=C3OEMSDYCFYJTK2H3KS2"
var eventbriteCategoriesURL = eventapiURL + "/categories/?" + eventapiToken;
var eventbriteSubCategoriesURL = eventapiURL + "/subcategories/?" + eventapiToken;
var eventPage = '';
//Initialise all the variables for form submission
var clickedCategory = '';
var clickedCategoryID = '';
var clickedSubCategory = '';
var clickedSubCategoryID = '';
var clickedKeyword = '';
var clickedDistance = '';
var clickedStartDate = '';
var clickedEndDate = '';
var clickedAgeCheck = '';
var clickedFreeCheck = '';
var eventbriteSearchURL = '';
var subcatagoryArray = '';
var catagoryArray = '';
var eventLocations = [];
var map;
var infowindow;
// Function Definitions
function showPosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    coordsValue = true;
    if (coordsValue) {
        initMap(latitude, longitude);
    }
};

function getLocation(cb) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            showPosition(position);
            cb();
        });
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
        cb();
    }
};

function initMap(latitude, longitude) {
    var userLocation = {
        lat: latitude,
        lng: longitude
    }
    map = new google.maps.Map(
        document.getElementById("mapInitPage"), {
            zoom: 10,
            center: userLocation
        });
    var marker = new google.maps.Marker({
        position: userLocation,
        title: "You are here",
        map: map
    });
}

var reverseGeo = function () {
    var geocoder = new google.maps.Geocoder;
    var latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    geocoder.geocode({ 'location': latlng }, function (results, status) {
        console.log("Address", results[0].formatted_address);
        $('#location').val(results[0].formatted_address)
    });
}

function autoMap() {
    var input = document.getElementById('location');
    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        latitude = place.geometry.location.lat()
        longitude = place.geometry.location.lng()
    });
}



$(document).ready(function () {
    // getLocation();
    getEventcategories();
    makeAPIcall();



    // <--------------------------------------------------------------------------------------------------->
    //---------------------------THIS SECTION IS FOR EVENBRITE API --------------------------

    //Call to get the categories list.

    function getEventcategories() {
        $.ajax({
            url: eventbriteCategoriesURL,
            method: "GET"
        }) //On response get the name and ID and push it to the eventbriteCategories array
            .then(function (response) {
                for (var i = 0; i < response.categories.length; i++) {
                    eventbriteCategories.push({
                        Name: response.categories[i].name,
                        ID: response.categories[i].id
                    });
                }
                //From the eventbriteCategories array populate the select list  of category Name
                for (var j = 0; j < eventbriteCategories.length; j++) {
                    var category = eventbriteCategories[j].Name;
                    var categoriesList = $("<option>").text(category);
                    $("#eventCategories").append(categoriesList);
                }
            });
    }

    //Call to get the subcategories list.
    //We need to check till pageination.continuation does not return a token
    function makeAPIcall(continuation = "") {
        if (continuation !== "") {
            var continuationString = "&continuation=" + eventPage;
            eventbriteSubCategoriesURL = eventbriteSubCategoriesURL + continuationString
        }

        $.ajax({
            url: eventbriteSubCategoriesURL,
            method: "GET"
        }) //On response get the name,ID and parent ID and push it to the eventbriteCategories array. 
            //We want the parent ID as on selection of relavant category in the select listonly the relavant subcategories shouls appear
            .then(function (response) {
                for (var i = 0; i < response.subcategories.length; i++) {
                    eventbriteSubCategories.push({
                        Name: response.subcategories[i].name,
                        ID: response.subcategories[i].id,
                        parentID: response.subcategories[i].parent_category.id,
                        parentName: response.subcategories[i].parent_category.name
                    });
                }
                eventPage = response.pagination.continuation;

                if (eventPage) {
                    makeAPIcall(eventPage);
                }
            });
    }

    function getEventInfo() {
        $.ajax({
            url: eventbriteSearchURL,
            method: "GET"
        })
            .then(function (response) {
                //Call to get the events based on search paramenters
                console.log(response);
                var venueList = [];
                for (var i = 0; i < response.events.length; i++) {
                    var venueId = response.events[i].venue_id;
                    var venueName = response.events[i].name.text;
                    var venueUrl = response.events[i].url;
                    console.log(venueName);
                    console.log(venueId);
                    $.ajax({
                        url: `${eventapiURL}venues/${venueId}/?${eventapiToken}`,
                        method: "GET"
                    })
                        .then(function (response) {
                            var lat = parseFloat(response.latitude);
                            var long = parseFloat(response.longitude);
                            var eventLocation = {
                                lat: lat,
                                lng: long
                            }
                            console.log(lat);
                            console.log(long);
                            var contentString = '<a href="' + venueUrl + '">' + venueName + '</a>';
                            infowindow = new google.maps.InfoWindow({
                                content: contentString
                            });
                            var marker = new google.maps.Marker({
                                position: new google.maps.LatLng(eventLocation),
                                map: map
                            });
                            marker.addListener('click', function () {
                                infowindow.open(map, marker);
                            })
                        })
                }
            });
    }

    //On selecting the categories, appropriate subcategories need to populate
    $("#eventCategories").on('change', function () {
        var selectedVal = $(this).val();
        $("#SubeventCategories").empty();
        if (selectedVal != "Select an Option") {
            $("#SubeventCategories").removeAttr("disabled");
        } else {
            $('#SubeventCategories').attr('disabled', true)

        }
        for (var i = 0; i < eventbriteSubCategories.length; i++) {
            if (selectedVal === eventbriteSubCategories[i].parentName) {
                var SubcategoriesList = $("<option>").text(eventbriteSubCategories[i].Name);
                $("#SubeventCategories").append(SubcategoriesList);
            }
        }

    });

    $("#submitButton").click(function (event) {
        event.preventDefault();
        clickedCategory = $("#eventCategories").val();
        clickedSubCategory = $("#SubeventCategories").val();
        clickedKeyword = $("#keywordSearch").val();
        clickedDistance = $("#maxDistance").val();
        //convert the start and end date to format'YYYY-MM-DDTHH:MM:SS' as API will accept this
        clickedStartDate = moment($("#dateStart").val(), "YYYY-MM-DD").format('YYYY-MM-DDTHH:MM:SS');
        clickedEndDate = moment($("#dateEnd").val(), "YYYY-MM-DD").format('YYYY-MM-DDTHH:MM:SS');
        if ($('#ageCheck')[0].checked) {
            clickedAgeCheck = true;
        }
        //if checkbox fro free events is checked,toggle the output for API.
        if ($('#freeCheck')[0].checked) {
            clickedFreeCheck = "free";
        } else {
            clickedFreeCheck = "paid";
        }
        //Filter all the categories in eventbriteCategories array
        // and create a new array to show the filtered list.
        catagoryArray = eventbriteCategories.filter(function (catagoryArray) {
            return catagoryArray.Name === clickedCategory;
        });
        //Get the ID based on the catagoryArray array.
        clickedCategoryID = catagoryArray[0].ID;
        //Filter all the subcategories in eventbriteCategories array
        // and create a new array to show the filtered list.
        subcatagoryArray = eventbriteSubCategories.filter(function (subcatagoryArray) {
            return subcatagoryArray.Name === clickedSubCategory;

        });
        //Get the ID based on the subcatagoryArray array and category ID.
        for (var k = 0; k < subcatagoryArray.length; k++) {
            if (subcatagoryArray[k].Name === clickedSubCategory && subcatagoryArray[k].parentID === clickedCategoryID) {
                clickedSubCategoryID = subcatagoryArray[k].ID;
            }
        }
        //Depending on clickedAgeCheck is true or false, create the URL for EventBrite API search
        if (clickedAgeCheck) {
            eventbriteSearchURL = eventapiURL + "events/search/?q=" + clickedKeyword + "&location.within=" +
                clickedDistance + "km&location.latitude=" + latitude + "&location.longitude=" +
                longitude + "&categories=" + clickedCategoryID + "&subcategories=" + clickedSubCategoryID +
                "&price=" + clickedFreeCheck + "&include_adult_events=on" + "&start_date.range_start=" +
                clickedStartDate + "&start_date.range_end=" + clickedEndDate + "&" + eventapiToken;
        } else {
            eventbriteSearchURL = eventapiURL + "events/search/?q=" + clickedKeyword + "&location.within=" +
                clickedDistance + "km&location.latitude=" + latitude + "&location.longitude=" +
                longitude + "&categories=" + clickedCategoryID + "&subcategories=" + clickedSubCategoryID +
                "&price=" + clickedFreeCheck + "&start_date.range_start=" +
                clickedStartDate + "&start_date.range_end=" + clickedEndDate + "&" + eventapiToken;
        }

        getEventInfo();
        // console.log("Eventbrite URL", eventbriteSearchURL);
        // console.log("EventBrite Subcatagories", eventbriteSubCategories);


    });

    //run the geolocation function
    $('#findMe').on('click', function (event) {
        event.preventDefault();
        getLocation(reverseGeo);
    })
});