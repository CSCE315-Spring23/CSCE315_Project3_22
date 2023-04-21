function refresh_items() {
    var xhr = new XMLHttpRequest();

    xhr.onload = () => { // executes when response has been sent
        // menu, menu_ingredients, display_items
        var response = JSON.parse(xhr.response);
        console.log(response.menu);
        console.log(response.menu_ingredients);
        console.log(response.display_items);

        // example of how to set data-* elements in an html object, so you don't have to query the backend again
        // i.e. <div id=div data-ingredients=some string variable></div>
        // data is now stored in the html, accessible with div.dataset.ingredients
        // ing_button.dataset.ingredients = join(response.menu_ingredients[request.idx]);

        var html = "";
        for (let i = 0; i < response.display_items.length; ++i) {
            html += '<div id=display_item_' + i + '>';
            html += '<h3>' + response.menu[response.display_items[i]].menu_item_id + ' | ' + response.menu[response.display_items[i]].category + '</h3>';
            for (let j = 0; j < response.menu_ingredients[response.display_items[i]].length; ++j) {
                html += '<p>' + response.menu_ingredients[response.display_items[i]][j] + '</p>';
            }
            html += '</div>';
        }

        $('#display_items_container').html(html);
        setTimeout(() => {
            refresh_items();
        }, 10000);
    }

    xhr.open("PUT", "/menu_board/refresh_items", true);
    xhr.send();
}





