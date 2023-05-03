/**
 * Functions for the user side, for loading the menu items, displaying the popup for selecting ingredients and additives and handling adding items to the cart
 * @module user
 */
/**
 * This array stores cart information for the user
 *
 * @memberof module:user
 * @name Cart
 * @type {Array}
 */
let cart = [];


/**
 * Capitalizes the first letter of each word in the given string.
 *
 * @memberof module:user
 * @function
 * @name capitalize_words
 * @param {string} str - The string to capitalize the words of.
 * @returns {string} The capitalized string.
 */
function capitalize_words(str) {
    const words = str.split(" ");
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    const capitalizedStr = capitalizedWords.join(" ");

    return capitalizedStr;
}


/**
 * Loads the ingredients for a given menu item ID.
 *
 * @memberof module:user
 * @async
 * @function
 * @name load_ingredients
 * @param {string} _menu_item_id - The menu item ID to load the ingredients for.
 * @returns {Promise<string[]>} A promise that resolves with an array of ingredient names.
 */
async function load_ingredients(_menu_item_id) {
    const ingredients = [];

    const response = await fetch(`/user/item-ingredients?menu_item_id=${_menu_item_id.toLowerCase().trim() + " - 20"}`);
    const data = await response.json();
    data.forEach(item => {
            // filter out straws and cups for popup display
            if (item.product_name != "straws" && item.product_name.substring(0, 4) != "cups")
            ingredients.push(item.product_name);
    });

    return ingredients;
}


/**
 * Loads the available additives from the server.
 *
 * @memberof module:user
 * @async
 * @function
 * @name load_additives
 * @returns {Promise<string[]>} A promise that resolves with an array of additive names.
 */
async function load_additives() {
    const additives = [];

    const response = await fetch("/user/additives");
    const data = await response.json();
    data.forEach(item => {
        additives.push(item.product_name);
    });

    return additives;
}


/**
 * Retrieves the price of a menu item from the server.
 *
 * @memberof module:user
 * @async
 * @function
 * @name get_item_price
 * @param {string} _item - The ID of the menu item to retrieve the price for.
 * @returns {Promise<number>} A promise that resolves with the price of the menu item as a number.
 */
async function get_item_price(_item) {
    let item_price = 0.00;

    const response = await fetch(`/user/item-price?menu_item_id=${_item}`);
    const data = await response.json();
    data.forEach(item => {
        item_price =  item.price;
    });

    return item_price;
}


/**
 * Gets the content for the popup window and inserts the html elements.
 * 
 * @memberof module:user
 * @async
 * @function
 * @name getContent
 * @param {string} imageSrc - The URL of the image to display in the popup.
 * @param {string} description - The description to display in the popup.
 * @param {string} _menu_item_id - The ID of the menu item to display in the popup.
 * @returns {Promise<void>} - A Promise that resolves when the content has been loaded.
 */
async function getContent(imageSrc, description, _menu_item_id) {
    // load the smoothie name
    const popupName = document.querySelector(".popup-smoothie-name h2");
    popupName.textContent = _menu_item_id;

    // load the image and description
    const popupImage = document.querySelector(".popup-image img");
    const popupDesc = document.querySelector(".popup-desc p");

    popupImage.src = imageSrc;
    popupDesc.textContent = description;

    // add size selection
    const item_price_20 = await get_item_price(_menu_item_id.trim().toLowerCase() + " - 20");
    const item_price_32 = await get_item_price(_menu_item_id.trim().toLowerCase() + " - 32");
    const item_price_40 = await get_item_price(_menu_item_id.trim().toLowerCase() + " - 40");

    const size_container = document.querySelector(".size-container");
    size_container.innerHTML = `
        <div>
            <input type="radio" name="size" value="20">
            <label>20 oz - $${item_price_20}</label><br>
        </div>
        <div>
            <input type="radio" name="size" value="32">
            <label>32 oz - $${item_price_32}</label><br>
        </div>
        <div>
            <input type="radio" name="size" value="40">
            <label>40 oz - $${item_price_40}</label>
        </div>`;

    // load the ingredients
    const ingredients = await load_ingredients(_menu_item_id);
    
    const ingredients_div = document.querySelector(".popup-ingredient-selection");
    ingredients_div.innerHTML = `<h3>Select Ingredients</h3>`;

    for (let i = 0; i < ingredients.length; i++) {
        ingredients_div.innerHTML += 
            `<label>
                <input type="checkbox" name="option1" value="1" checked>
                ${ingredients[i]}
            </label>`;
    }
    ingredients_div.style.padding = "20px";

    // load additives
    const additives = await load_additives();

    const additives_div = document.querySelector(".popup-additives-selection");
    additives_div.innerHTML = `<h3>Select Additives</h3>`;

    for (let i = 0; i < additives.length; i++) {
        additives_div.innerHTML += 
            `<label>
                <input type="checkbox" name="option1" value="1">
                ${additives[i]}
            </label>`;
    }
    additives_div.style.padding = "20px";
}


/**
 * Displays a popup with details of a menu item when the add to cart button is clicked.
 * 
 *
 * @memberof module:user
 * @async
 * @function
 * @name showPopup
 * @param {Event} event - The click event
 */
function showPopup(event) {
    // get the menu item
    const menuItem = event.target.closest(".menu-item");
    
    // get information for popup
    const imageSrc = menuItem.querySelector(".menu-item-image img").src;
    const description = menuItem.querySelector(".menu-item-description p").textContent;

    const menu_item_id = menuItem.querySelector(".menu-item-name").textContent;
    let menu_item_id_q = menu_item_id.toLowerCase().trim() + " - 20"; // format item properly for query

    getContent(imageSrc, description, menu_item_id);

    // display the popup
    const popupContainer = document.getElementById("popup-container");
    popupContainer.style.display = "flex";

    // set delay so items can load
    setTimeout(() => {
        popupContainer.style.opacity = "1";
    }, 500);
    
}


/**
 * Asynchronously gets the selected smoothie details from the popup window and adds it to the cart.
 * 
 * @memberof module:user
 * @async
 * @function
 * @name hidePopup
 * @returns {Promise<void>}
 */
async function hidePopup() {
    const smoothie_name = document.querySelector(".popup-smoothie-name").textContent.trim();
    const selectedSize = document.querySelector('input[name="size"]:checked').value;

    // get ingredients
    const ingredientsCheckboxes = document.querySelectorAll(".popup-ingredient-selection input[type='checkbox']");
    const selectedIngredients = [];
    ingredientsCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedIngredients.push(checkbox.parentElement.textContent.trim());
        }
    });

    // get additives
    const additivesCheckboxes = document.querySelectorAll(".popup-additives-selection input[type='checkbox']");
    const selectedAdditives = [];
    additivesCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedAdditives.push(checkbox.parentElement.textContent.trim());
        }
    });

    // create smoothie name for query
    let smoothie_name_real = smoothie_name.toLowerCase() + " - " + selectedSize;

    // get smoothie price
    let smoothie_price = await get_item_price(smoothie_name_real);

    // create smoothie object
    const smoothie = {
        name: smoothie_name,
        size: selectedSize,
        ingredients: selectedIngredients,
        additives: selectedAdditives,
        price: smoothie_price
    };

    // add smoothie object to cart
    cart.push(smoothie);

    // update price of checkout button
    const checkout_button = document.querySelector(".checkout-container");
    checkout_button.style.display = "block";

    let cart_price = parseFloat(document.querySelector('.checkout-container h2').textContent.slice(10));
    document.querySelector('.checkout-container h2').textContent = `CHECKOUT $${(cart_price + parseFloat(smoothie_price)).toFixed(2)}`;

    // hide the popup container
    const popupContainer = document.getElementById("popup-container");
    popupContainer.style.opacity = "0";
    popupContainer.style.display = "none";
}


/**
 * Hides the popup container when someone clicks the back button.
 * @memberof module:user
 * @name hidePopupSimple
 * @function
 * @returns {void}
 */
function hidePopupSimple() {
    const popupContainer = document.getElementById("popup-container");
    popupContainer.style.opacity = "0";
    popupContainer.style.display = "none";
}

/**
 * Attaches a "click" event listener to all the "Add to Cart" buttons to display the smoothie popup when clicked.
 * @memberof module:user
 * @name attachAddToCartEventListeners
 * @function
 * @returns {void}
 */
function attachAddToCartEventListeners() {
    const addItemButtons = document.querySelectorAll(".add-item-button button");
    addItemButtons.forEach(function(button) {
        button.addEventListener("click", showPopup);
    });
}


/**
 * Loads the menu items for a given category by making a fetch request and rendering the items to the page.
 * @memberof module:user
 * @name loadMenuItems
 * @function
 * @param {string} category - The category of the menu items to load.
 * @returns {void}
 */
function loadMenuItems(category) {
    // select the main content container and clear its contents
    const main_container = document.getElementById('main-container');
    main_container.innerHTML = ``;

    // create menu set so no duplicate items are added
    const menu_set = new Set();

    // get the items that belong to the category from the database and insert html elements
    fetch(`/user/menu-items?category=${category}`)
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            let item_name_spliced;
            if (category == "snacks") {
                item_name_spliced = capitalize_words(item.menu_item_id);
            }
            else {
                item_name_spliced = capitalize_words(item.menu_item_id.slice(0, -5));
            }

            if (!menu_set.has(item_name_spliced)) {
                menu_set.add(item_name_spliced);
                
                if (category == "snacks") {
                    main_container.innerHTML += `
                        <div class="menu-item">
                            <div class="menu-item-image">
                                <img src="../images/snack0.png" style="width:350px; height:300px;">
                            </div>
                            <div class="menu-item-name">
                                <h2>${item_name_spliced}</h2>
                            </div>
                            <div class="menu-item-description">
                                <p>Description of a snack. The snack is good. The snack is not bad. Buy this snack. Description of a snack. The snack is good. The snack is not bad. Buy this snack.</p>
                            </div>
                            <div class="add-item-button">
                                <button>Add to Cart</button>
                            </div>
                        </div>
                    `;
                }
                else {
                    main_container.innerHTML += `
                        <div class="menu-item">
                            <div class="menu-item-image">
                                <img src="../images/smoothie${Math.floor(Math.random() * 3)}.png" style="width:350px; height:300px;">
                            </div>
                            <div class="menu-item-name">
                                <h2>${item_name_spliced}</h2>
                            </div>
                            <div class="menu-item-description">
                                <p>Description of a smoothie. The smoothie is good. The smoothie is not bad. Buy this smoothie. Description of a smoothie. The smoothie is good. The smoothie is not bad. Buy this smoothie.</p>
                            </div>
                            <div class="add-item-button">
                                <button>Add to Cart</button>
                            </div>
                        </div>
                    `;
                }
                
            }
        });

        // attach event listener to add to cart button
        attachAddToCartEventListeners();

        // attach event listender to add to cart button within the popup
        document.querySelector(".popup-add-button button").addEventListener("click", hidePopup);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll("#category-container button").forEach(button => {
        button.addEventListener("click", (event) => {
            // remove the 'active' class from all buttons
            document.querySelectorAll("#category-container button").forEach(btn => {
                btn.classList.remove("active");
            });
    
            // add the 'active' class to the clicked button
            event.target.classList.add("active");
            
            const category = event.target.textContent.toLowerCase();
            loadMenuItems(category);
        });
    });
    
    // add event listender to checkout button, takes you to cart
    const checkout_button = document.querySelector(".checkout-button");
    checkout_button.addEventListener("click", async () => {
        let cart_json = JSON.stringify(cart);
    
        // send cart data to the server
        await fetch("/user/store-cart", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: cart_json
        });
        
        window.location.href = "/user/cart";
    })
    
    loadMenuItems("featured");
});
