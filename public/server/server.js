// SESSION INFORMATION
let cart = [];
// HELPER CODE
document.addEventListener("DOMContentLoaded", () => {
    function capitalize_words(str) {
        // split the string into an array of words
        const words = str.split(" ");

        // map over the array of words and capitalize the first letter of each word
        const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));

        // join the capitalized words back into a new string
        const capitalizedStr = capitalizedWords.join(" ");

        return capitalizedStr;
    }

    async function load_ingredients(_menu_item_id) {
        const ingredients = [];

        const response = await fetch(`/server/item-ingredients?menu_item_id=${_menu_item_id.toLowerCase().trim() + " - 20"}`);
        const data = await response.json();
        data.forEach(item => {
                // filter out straws and cups for popup display
                if (item.product_name != "straws" && item.product_name.substring(0, 4) != "cups")
                ingredients.push(item.product_name);
        });

        return ingredients;
    }

    async function load_additives() {
        const additives = [];

        const response = await fetch("/server/additives");
        const data = await response.json();
        data.forEach(item => {
            additives.push(item.product_name);
        });

        return additives;
    }

    async function get_item_price(_item) {
        let item_price = 0.00;

        const response = await fetch(`/server/item-price?menu_item_id=${_item}`);
        const data = await response.json();
        data.forEach(item => {
            item_price =  item.price;
        });

        return item_price;
    }

    // POPUP CODE
    async function getContent(description, _menu_item_id) {
        // load the smoothie name
        const popupName = document.querySelector(".popup-smoothie-name h2");
        popupName.textContent = _menu_item_id;
        
        // add size selection
        const size_container = document.querySelector(".size-container");
        size_container.innerHTML = `
            <div>
                <input type="radio" name="size" value="20">
                <label>20</label><br>
            </div>
            <div>
                <input type="radio" name="size" value="32">
                <label>32</label><br>
            </div>
            <div>
                <input type="radio" name="size" value="40">
                <label>40</label>
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

    function clearItems() {
    // Clear the cart array
    cart = [];

    // Update the order summary
    updateOrderSummary();
    }

    // Add the missing updateOrderSummary function
    function updateOrderSummary() {
    const orderSummary = document.querySelector("#order-summary");
    orderSummary.innerHTML = ""; // Clear the current order summary

    let total = 0;

    const headings = `
        <div class="summary-item">
            <h3>Item Name</h3>
            <h3>Size</h3>
            <h3>Price</h3>
        </div>
    `;
    orderSummary.innerHTML += headings;

    cart.forEach((smoothie, index) => {
        total += parseFloat(smoothie.price);

        // Remove the size and dash from the smoothie name
        const displayName = capitalize_words(smoothie.name.replace(/ - \d+$/, ""));

        const smoothieItem = `
            <div class="summary-item">
                <p>${displayName}</p>
                <p>${smoothie.size}</p>
                <p>$${parseFloat(smoothie.price).toFixed(2)}</p>
            </div>
        `;

        orderSummary.innerHTML += smoothieItem;
    });

    // Update the total amount in the Total-label
    const totalLabel = document.querySelector("#total-label h1");
    totalLabel.textContent = `Total: $${total.toFixed(2)}`;
    }


    async function showPopup(menu_item_id) {
    // get information for popup
    const description = ""; // Since you want to remove the description, set it to an empty string.

    await getContent(description, menu_item_id);

    // display the popup
    const popupContainer = document.getElementById("popup-container");
    popupContainer.style.display = "flex";

    // set delay so items can load
    setTimeout(() => {
        popupContainer.style.opacity = "1";
    }, 200);
    }

    // get rid of pop and handle cart logic
    async function hidePopup() {
        // get name
        const smoothie_name = document.querySelector(".popup-smoothie-name").textContent.trim();

        // get selected size
        const selectedSize = document.querySelector('input[name="size"]:checked').value;

        // get selected ingredients
        const ingredientsCheckboxes = document.querySelectorAll(".popup-ingredient-selection input[type='checkbox']");
        const selectedIngredients = [];
        ingredientsCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedIngredients.push(checkbox.parentElement.textContent.trim());
            }
        });

        // get selected additives
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

        // Create smoothie object
        const smoothie = {
            name: smoothie_name_real,
            size: selectedSize,
            ingredients: selectedIngredients,
            additives: selectedAdditives,
            price: smoothie_price
        };

        // Add smoothie object to cart
        cart.push(smoothie);

        // Update the order summary and total amount
        updateOrderSummary();

        // hide the popup container
        const popupContainer = document.getElementById("popup-container");
        popupContainer.style.opacity = "0";
        popupContainer.style.display = "none";
    }

    async function place_order() {
        let cart_json = JSON.stringify(cart);

        // Send cart data to the server
        try {
            const response = await fetch("/server", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: cart_json
            });

            // If the server responds with a success status, redirect to the home page
            if (response.ok) {
                window.location.href = "/";
                console.log("TEST")
            } 
            else {
                console.error("Failed to place order. Server responded with status:", response.status);
            }
        } 
        catch (error) {
            console.error("Failed to place order. Error:", error);
        }
    }

    const place_order_button = document.querySelector(".place-order-button");

    place_order_button.addEventListener('click', place_order);


    function attachAddToCartEventListeners() {
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(function(item) {
        const menu_item_id = item.querySelector(".menu-item-name").textContent;
        item.addEventListener("click", () => showPopup(menu_item_id));
    });
    }
    function attachPopupAddToCartEventListener() {
        const addToCartButton = document.querySelector(".popup-add-button button");
        addToCartButton.addEventListener("click", hidePopup);
    }


    function attachClearItemsEventListener() {
    const clearItemsButton = document.querySelector("#buttons-container button:first-child");
    clearItemsButton.addEventListener("click", clearItems);
    }


    //document.getElementById("popup-container").addEventListener("click", hidePopup);

    // CATEGORY CODE
    function loadMenuItems(category) {
    // select the menu container and clear its contents
    const menu_container = document.getElementById('menu-container');
    menu_container.innerHTML = ``;

    // create menu set
    const menu_set = new Set();

    fetch(`/server/menu-items?category=${category}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                let item_name_spliced;
                if (category == "snacks") {
                    item_name_spliced = capitalize_words(item.menu_item_id.replace(/ - \d+$/, ""));
                }
                else {
                    item_name_spliced = capitalize_words(item.menu_item_id.slice(0, -5));
                }

                if (!menu_set.has(item_name_spliced)) {
                    menu_set.add(item_name_spliced);
                    
                    if (category == "snacks") {
                menu_container.innerHTML += `
                    <div class="sub-grid-item menu-item-list">
                        <div class="menu-item">
                            <div class="menu-item-name">
                                <h2 class="menu-item-text">${item_name_spliced}</h2>
                            </div>
                            <div class="add-item-button">
                                <button>Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                menu_container.innerHTML += `
                    <div class="sub-grid-item menu-item-list">
                        <div class="menu-item">
                            <div class="menu-item-name">
                                <h2 class="menu-item-text">${item_name_spliced}</h2>
                            </div>
                            <div class="add-item-button">
                                <button>Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `;
                    }
                }
            });

            // attach event listener to add to cart button
            attachAddToCartEventListeners();
            attachPopupAddToCartEventListener();

            // attach event listender to add to cart button within the popup
            document.querySelector(".popup-add-button button").addEventListener("click", hidePopup);
        });
    }

    document.querySelectorAll("#category-container button").forEach(button => {
        button.addEventListener("click", (event) => {
            // Remove the 'active' class from all buttons
            document.querySelectorAll("#category-container button").forEach(btn => {
                btn.classList.remove("active");
            });

            // Add the 'active' class to the clicked button
            event.target.classList.add("active");
            
            const category = event.target.textContent.toLowerCase();
            loadMenuItems(category);
        });
    });

    loadMenuItems("featured");
    attachClearItemsEventListener();
});