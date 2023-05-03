/**
 * Functions for the cart on the user side, for placing orders
 * @module user/cart
 */
// set up the total price of the cart when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
    let cart_total = 0.00;

    document.querySelectorAll(".cart-item").forEach(item => {
        let item_price = parseFloat(item.querySelector(".cart-item-price").textContent.trim().substring(1));

        cart_total += item_price;
    });

    document.querySelector(".total-price-div").textContent = `TOTAL: $${cart_total}`;
});


/**
 * Places an order by converting the smoothie cart data into a JSON object and sending it to the server.
 * 
 * @memberof module:user/cart
 * @name place_order
 * @async
 * @function
 * @returns {Promise<void>}
 */
async function place_order() {
    let cart = [];

    const cart_items = document.querySelectorAll(".cart-item");

    // handle cart with no items
    if (cart_items.length == 0) {
        alert("Your cart is empty. Please add items before placing an order.");
        return;
    }

    cart_items.forEach(item => {
        const smoothie_name = item.querySelector(".cart-item-name").textContent;
        const smoothie_size = item.querySelector(".cart-item-size").textContent;
        const smoothie_price = item.querySelector(".cart-item-price").textContent;

        // get smoothie ingredients
        const ingredients = [];
        const smoothie_ingredients = item.querySelectorAll(".ingredients-info li");
        smoothie_ingredients.forEach(ingredient => {
            ingredients.push(ingredient.textContent);
        });

        // get smoothie additives
        const additives = [];
        const smoothie_additives = item.querySelectorAll(".additives-info li");
        smoothie_additives.forEach(additive => {
            additives.push(additive.textContent);
        })

        // convert smoothie information into database format and add to cart
        const smoothie_name_db = smoothie_name.toLowerCase().trim() + " - " + smoothie_size.trim().slice(0, -3);
        const smoothie_price_db = smoothie_price.trim().slice(1, smoothie_price.length);

        const smoothie = {
            name: smoothie_name_db,
            ingredients: ingredients,
            additives: additives,
            price: smoothie_price_db
        };
        
        cart.push(smoothie);
    });

    let cart_json = JSON.stringify(cart);

    // send cart data to the server
    try {
        const response = await fetch("/user/place-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: cart_json
        });

        // if the server responds with a success status, redirect to the home page
        if (response.ok) {
            alert("Order placed successfully! Enjoy!");
            window.location.href = "/user";
        } 
        else {
            console.error("Failed to place order. Server responded with status:", response.status);
        }
    } 
    catch (error) {
        console.error("Failed to place order. Error:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // remove individual items from the cart
    const remove_buttons = document.querySelectorAll(".remove-button");

    remove_buttons.forEach(button => {
        button.addEventListener('click', () => {
            const cart_item = button.parentNode.parentNode.parentNode;

            let current_total = parseFloat(document.querySelector(".total-price-div").textContent.slice(8));

            let item_price = parseFloat(cart_item.querySelector(".cart-item-price").textContent.trim().slice(1));
            
            document.querySelector(".total-price-div").textContent = `TOTAL: $${current_total - item_price}`;

            cart_item.remove();
        });
    });

    // go back to the menu
    const back_to_menu_button = document.querySelector(".back-to-menu-button");
    back_to_menu_button.addEventListener("click", () => {
        window.location.href = "/user";
    })

    // clear all item from the cart
    const clear_button = document.querySelector(".clear-button");

    clear_button.addEventListener('click', () => {
        const item_container = document.querySelector(".item-container");
        item_container.innerHTML = "";

        document.querySelector(".total-price-div").textContent = `TOTAL: $0.00`;
    })

    // place the order and update the database
    const place_order_button = document.querySelector(".place-order-button");

    place_order_button.addEventListener('click', place_order);
});