// Import necessary modules and data
import {cart, removeFromCart} from '../data/cart.js';
import {products} from '../data/products.js';
import {formatCurrency} from './utils/money.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import {deliveryoptions} from '../data/deliveryoptions.js';

let cartSummaryHTML = '';

// Iterate over each item in the cart to generate the HTML
cart.forEach((cartItem) => {
  const productId = cartItem.productId;

  // Find the matching product from the products list
  let matchingProduct;
  products.forEach((product) => {
    if (product.id === productId) {
      matchingProduct = product;
    }
  });

  // Check if a valid product was found
  if (!matchingProduct) {
    console.error(`Product with ID ${productId} not found.`);
    return; // Skip this cart item if no product is found
  }

  // Get the delivery option ID for the cart item
  let deliveryoptionId = cartItem.deliveryoptionId;

  // If the delivery option ID is missing, assign a default delivery option ID
  if (!deliveryoptionId) {
    console.warn(`Delivery option ID is missing for cart item with product ID ${productId}. Assigning default delivery option.`);
    deliveryoptionId = deliveryoptions[0].id; // Assign default option
  }

  // Find the delivery option for the cart item
  let deliveryoption = deliveryoptions.find((option) => option.id === deliveryoptionId);

  // If no delivery option is found, assign the first available option as a default
  if (!deliveryoption) {
    console.warn(`Delivery option with ID ${deliveryoptionId} not found. Assigning default delivery option.`);
    deliveryoption = deliveryoptions[0]; // Assign a default delivery option
  }

  // Calculate the delivery date
  const today = dayjs();
  const deliveryDate = today.add(deliveryoption.deliveryDays, 'days');
  const dateString = deliveryDate.format('dddd, MMMM D');

  // Generate the cart summary HTML for the current cart item
  cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date">
        Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image" src="${matchingProduct.image}">

        <div class="cart-item-details">
          <div class="product-name">
            ${matchingProduct.name}
          </div>
          <div class="product-price">
            $${formatCurrency(matchingProduct.priceCents)}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: <span class="quantity-label">${cartItem.quantity}</span>
            </span>
            <span class="update-quantity-link link-primary">
              Update
            </span>
            <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
              Delete
            </span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
          ${deliveryOptionsHTML(matchingProduct, cartItem)}
        </div>
      </div>
    </div>
  `;
});

// Function to generate the delivery options HTML
function deliveryOptionsHTML(matchingProduct, cartItem) {
  let html = '';

  deliveryoptions.forEach((deliveryoption) => {
    const today = dayjs();
    const deliveryDate = today.add(deliveryoption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');
    const priceString = deliveryoption.priceCents === 0 ? 'FREE' : `$${formatCurrency(deliveryoption.priceCents)}`;
    const isChecked = deliveryoption.id === cartItem.deliveryoptionId;

    html += `
      <div class="delivery-option">
        <input type="radio" ${isChecked ? 'checked' : ''} class="delivery-option-input" name="delivery-option-${matchingProduct.id}">
        <div>
          <div class="delivery-option-date">
            ${dateString}
          </div>
          <div class="delivery-option-price">
            ${priceString} - Shipping
          </div>
        </div>
      </div>
    `;
  });

  return html;
}

// Update the HTML content of the order summary
document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

// Add event listeners to delete links
document.querySelectorAll('.js-delete-link').forEach((link) => {
  link.addEventListener('click', () => {
    const productId = link.dataset.productId;
    removeFromCart(productId);

    const container = document.querySelector(`.js-cart-item-container-${productId}`);
    if (container) {
      container.remove();
    }
  });
});
