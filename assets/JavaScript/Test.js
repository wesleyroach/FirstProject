

$("#submitButton").click(function (event) {
    event.preventDefault();
    var accessToken = "&access_token=4a387b39a30c8a25f61f10a52bf6558b";
    var meetupUrl = "https://api.meetup.com/find/upcoming_events&sign=true&photo-host=public"
    var meetupLat = "&lat=" + latitude;
    var meetupLong = "&long=" + longitude

    $.ajax({
        url: "https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=145.0449558&page=20&lat=-37.877085099999995&access_token=4a387b39a30c8a25f61f10a52bf6558b",
        method: "GET"
    }).then(function (response) {
        console.log("Meetup Log", response)
        for (i = 0; i < response.events.length; i++) {
            console.log(i)
        }
    })
})
