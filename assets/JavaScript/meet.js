$(document).ready(function () {

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
                var categoriesList = $("<option id='cat1'>").text(category);
                $("#eventCategories").append(categoriesList);

            }
            console.log(response);
            console.log(eventbriteCategories);
        });

    //Call to get the subcategories list.
    var eventPage = '';


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
                for (var i = 0; i < response.subcategories.length; i++) {
                    eventbriteSubCategories.push({
                        Name: response.subcategories[i].name,
                        ID: response.subcategories[i].id,
                        parentID: response.subcategories[i].parent_category.id,
                    });
                }
                eventPage = response.pagination.continuation;
                console.log(response);
                console.log(eventbriteSubCategories);
                console.log(eventPage);

                if (eventPage) {
                    makeAPIcall(eventPage);
                }
            });

            console.log(eventbriteSubCategories);
    }

    makeAPIcall();
     $("#cat1").change(function () {
      var selectedVal = $(this).val();
        console.log(this);
        console.log("228");
    });
});