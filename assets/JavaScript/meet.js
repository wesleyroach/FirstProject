$(document).ready(function () {
    // <----------------------------------------------------------------------------------->
    // Google Maps & Geolocation APIs
    getLocation();
    // initMap();

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
    };

    var latitude = '';
    var longitude = '';
    var coordsValue = false;

    function showPosition(position) {
        // x.innerHTML = "Latitude: " + position.coords.latitude +
        //     "<br>Longitude: " + position.coords.longitude;
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        coordsValue = true;
        console.log(latitude);
        console.log(longitude);

        if (coordsValue) {
            initMap();
        }
    };



    function initMap() {
        var userLocation = {
            lat: latitude,
            lng: longitude
        }
        var map = new google.maps.Map(
            document.getElementById("mapInitPage"), {
                zoom: 15,
                center: userLocation
            });
        var marker = new google.maps.Marker({
            position: userLocation,
            map: map
        });
    }

    // <--------------------------------------------------------------------------------------------------->

    var eventbriteCategories = [];
    var eventbriteSubCategories = [];
    //EventBrite URL to get categories and subcategories
    var eventapiURL = "https://www.eventbriteapi.com/v3/"
    var eventapiToken = "token=C3OEMSDYCFYJTK2H3KS2"

    var eventbriteCategoriesURL = eventapiURL + "/categories/?" + eventapiToken;
    var eventbriteSubCategoriesURL = eventapiURL + "/subcategories/?" + eventapiToken;

    //Call to get the categories list.

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

    //Call to get the subcategories list.
    var eventPage = '';


    //We need to check till pageination.continuation does not return a token
    function makeAPIcall(continuation = "", count = 0) {
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
                console.log(response);
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
    //call the function  for subcategories
    makeAPIcall();
    //On selecting the categories, appropriate subcategories need to populate
    $("#eventCategories").on('change', function () {
        var selectedVal = $(this).val();
        $("#SubeventCategories").empty();
        //If the category value is "select an Option" then the subcategory is disabled
        if (selectedVal != "Select an Option") {
            $("#SubeventCategories").removeAttr("disabled");
        } else {
            $('#SubeventCategories').attr('disabled', true)
            $("#SubeventCategories").html("<option>Select An Option</option>");
        }
        else {
            $('#SubeventCategories').attr('disabled', true)

        }
        console.log(selectedVal);
        for (var i = 0; i < eventbriteSubCategories.length; i++) {
            if (selectedVal === eventbriteSubCategories[i].parentName) {
                var SubcategoriesList = $("<option>").text(eventbriteSubCategories[i].Name);
                $("#SubeventCategories").append(SubcategoriesList);
            }

        }

    });
});

$('button').on('click', function (event) {
    event.preventDefault();
});