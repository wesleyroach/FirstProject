$(document).ready(function () {
    var meetupLon = [144.963058];
    var meetupLat = [37.813629];
    var meetUpNameLink = [];

    //MeetUP API authentication including OAUTH Consumer key & OAUTH Consumer Redirect URL
    var urlParams = new URLSearchParams(window.location.hash.substr(1));
    console.log("url", urlParams);

    var searchParams = new URLSearchParams(urlParams);
    var access_token = searchParams.get("access_token");
    console.log("token= ", access_token);

    // store the #access_token in local storage
    localStorage.setItem("meetup_token", access_token);
    var localMeetuptoken = localStorage.getItem("meetup_token");
    console.log("Local Storage Token = ", localMeetuptoken);

    //Create the MeetUp API Call to Find Nearby Groups endpoint by passing the longitude & latitude

    var meetupapiURL = "https://api.meetup.com/find/groups?";
    var sign = "sign=true";
    var photohost = "&photo-host=public";
    var nuPages = "&page=";
    var pages = 2;
    var lon = "&lon=" + meetupLon;
    var lat = "&lat=" + meetupLat;

    // pass the #access_token in the API call

    var meetupLocation =
        meetupapiURL +
        sign +
        photohost +
        lon +
        lat +
        nuPages +
        pages +
        "&access_token=" +
        localMeetuptoken;

    // Call the MeetUp API to get nearby groups using the find/groups endpoint.

    $.ajax({
        url: meetupLocation,
        method: "GET",
        jsonp: "callback",
        dataType: "jsonp",
        headers: {
            // remove Authorization: `Bearer ${localMeetuptoken}` from the request header & placed in the ajax call
        }
    }).then(function (response) {
        console.log(1, response);
        //loop through response
        for (var k = 0; k < pages; k++) {
            mop = k + 1;
            var nameHawk = response.data[k].name;
            console.log(nameHawk);
            var catHawk = response.data[k].category.name;
            console.log(catHawk);
            var linkHawk = response.data[k].link;
            console.log(linkHawk);

            var markup =
                "<tr><td>" +
                mop +
                "</td><td>" +
                nameHawk +
                "</td><td>" +
                catHawk +
                "</td><td>" +
                linkHawk +
                "</td></tr>";
            $("#tablebody").append(markup);
        }
    });
});