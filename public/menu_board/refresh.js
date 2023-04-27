function capitalize_words(str) {
    // split the string into an array of words
    const words = str.split(" ");
    // map over the array of words and capitalize the first letter of each word
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    // join the capitalized words back into a new string
    const capitalizedStr = capitalizedWords.join(" ");
    return capitalizedStr;
}

function refresh_items() {
    var xhr = new XMLHttpRequest();

    xhr.onload = () => { // executes when response has been sent
        // menu, menu_ingredients, display_items
        var response = JSON.parse(xhr.response);
        console.log(response.category_to_img);
        // example of how to set data-* elements in an html object, so you don't have to query the backend again
        // i.e. <div id=div data-ingredients=some string variable></div>
        // data is now stored in the html, accessible with div.dataset.ingredients
        // ing_button.dataset.ingredients = join(response.menu_ingredients[request.idx]);

        var html = "";
        for (let i = 0; i < response.display_items.length; ++i) {
            html += '<div class="menu-item">';
            html += '<div class="menu-item-image"><img src="/images/menu_board_smoothies/smoothie_' + response.category_to_img[response.menu[response.display_items[i]].category] + '.png" style="width:350px; height:300px;"></div>';
            html += '<div class="menu-item-name"><h2>' + capitalize_words(response.menu[response.display_items[i]].menu_item_id) + ' | ' + capitalize_words(response.menu[response.display_items[i]].category) + '</h2></div>';
            html += '<div class="menu-item-description"><p>';
            for (let j = 0; j < response.menu_ingredients[response.display_items[i]].length - 1; ++j) {
                html += capitalize_words(response.menu_ingredients[response.display_items[i]][j]) + ', ';
            }
            html += capitalize_words(response.menu_ingredients[response.display_items[i]][response.menu_ingredients[response.display_items[i]].length - 1]);
            html += '</p></div></div>';
        }

        $('#display_items_container').html(html);
        setTimeout(() => {
            refresh_items();
        }, 15000);
    }

    xhr.open("PUT", "/menu_board/refresh_items", true);
    xhr.send();
}

