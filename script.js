// // Sample product database
const productDatabase = {
    "8901030865169": { id: "8901030865169", name: "Surf Excel Bar", price: 0.99, weight: 0.250, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/banana-1.png" },
    "8904109450327": { id: "8904109450327", name: "Organic Apple", price: 1.99, weight: 0.2, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/apple-1.png" },
    "3154141194306": { id: "3154141194306", name: "Rounder", price: 3.49, weight: 0.5, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/bread-1.png" },
    "4549526613845": { id: "4549526613845", name: "Calculator", price: 4.29, weight: 1.0, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/milk-1.png" },
    "8906098990587": { id: "8906098990587", name: "Cheddar Cheese", price: 5.99, weight: 0.3, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/cheese-1.png" },
    "523456789012": { id: "523456789012", name: "Free Range Eggs", price: 3.99, weight: 0.4, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/eggs-1.png" },
    "623456789012": { id: "623456789012", name: "Avocado", price: 2.49, weight: 0.2, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/avocado-1.png" },
    "723456789012": { id: "723456789012", name: "Chicken Breast", price: 8.99, weight: 0.5, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/chicken-1.png" },
    "823456789012": { id: "823456789012", name: "Chocolate Bar", price: 2.99, weight: 0.1, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/chocolate-1.png" },
    "923456789012": { id: "923456789012", name: "Potato Chips", price: 3.29, weight: 0.15, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/chips-1.png" },
    // "023456789012": { id: "023456789012", name: "Orange Juice", price: 4.49, weight: 1.0, image: "https://cdn.jsdelivr.net/gh/Leoche/uikit-elements/src/images/food/juice-1.png" }
};

// Cart state
let cart = [];
let html5QrCode;
let isScanning = false;

// DOM Elements
const startButton = document.getElementById('startButton');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const subtotalElement = document.getElementById('subtotal');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const checkoutItems = document.getElementById('checkout-items');
const checkoutSubtotal = document.getElementById('checkout-subtotal');
const checkoutTax = document.getElementById('checkout-tax');
const checkoutTotal = document.getElementById('checkout-total');
const expectedWeightElement = document.getElementById('expected-weight');
const actualWeightElement = document.getElementById('actual-weight');
const weightBar = document.getElementById('weight-bar');
const weightStatus = document.getElementById('weight-status');
const completeCheckoutButton = document.getElementById('complete-checkout');
const successModal = document.getElementById('success-modal');
const closeModalButton = document.getElementById('close-modal');
const continueShoppingButton = document.getElementById('continue-shopping');

// Initialize scanner
function initScanner() {
    html5QrCode = new Html5Qrcode("reader");

    startButton.addEventListener('click', () => {
        if (isScanning) {
            stopScanner();
        } else {
            startScanner();
        }
    });
}

// Start the scanner
function startScanner() {
    const qrConfig = { fps: 10, qrbox: { width: 250, height: 150 } };

    html5QrCode.start(
        { facingMode: "environment" },
        qrConfig,
        onScanSuccess
    ).then(() => {
        isScanning = true;
        startButton.innerHTML = 'Stop Scanner';
        startButton.classList.add('bg-red-600');
        startButton.classList.remove('btn-primary');
    }).catch((err) => {
        console.error('Error starting scanner:', err);
        alert('Could not start scanner. Please ensure camera permissions are granted.');
    });
}

// Stop the scanner
function stopScanner() {
    html5QrCode.stop().then(() => {
        isScanning = false;
        startButton.innerHTML = 'Start Scanner';
        startButton.classList.remove('bg-red-600');
        startButton.classList.add('btn-primary');
    }).catch((err) => {
        console.error('Error stopping scanner:', err);
    });
}

// On successful scan
let lastScanTime = 0;
let lastScannedBarcode = null;

function onScanSuccess(decodedText, decodedResult) {
    const now = Date.now();
    // Check if the scan is too close to the last scan
    if (decodedText === lastScannedBarcode && now - lastScanTime < 2000) {
        return; // Ignore this scan
    }
    lastScannedBarcode = decodedText;
    lastScanTime = now;

    // Check if the barcode exists in our database
    if (productDatabase[decodedText]) {

        const product = productDatabase[decodedText];

        // Check if product is already in cart, if so increment quantity
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                weight: product.weight,
                image: product.image,
                quantity: 1
            });
        }
        // Provide feedback
        playSuccessSound();
        showProductAddedNotification(product.name);

        // Update UI
        updateCartUI();
        updateTrolleyWeight();

    } else {
        // Handle unknown product
        prompt("Unknown product barcode:", decodedText);
    }
}

// Update cart UI
function updateCartUI() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-shopping-cart text-4xl mb-3 text-gray-300"></i>
                        <p>Your cart is empty</p>
                        <p class="text-sm mt-2">Scan products to add them to your cart</p>
                    </div>
                `;
        checkoutItems.innerHTML = `
                    <div class="text-center py-6 text-gray-500">
                        <p>No items in cart</p>
                        <p class="text-sm mt-2">Go to scanner to add items</p>
                    </div>
                `;
    } else {
        // Update cart items
        cartItems.innerHTML = cart.map(item => `
                    <div class="product-item flex items-center p-3 mb-3">
                        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-md mr-4">
                        <div class="flex-1">
                            <h4 class="font-semibold">${item.name}</h4>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500">$${item.price.toFixed(2)} × ${item.quantity}</span>
                                <span class="font-semibold">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                        <button class="remove-item ml-2 text-gray-400 hover:text-red-500" data-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');

        // Update checkout items
        checkoutItems.innerHTML = cart.map(item => `
                    <div class="flex justify-between items-center mb-3">
                        <div class="flex items-center">
                            <img src="${item.image}" alt="${item.name}" class="w-10 h-10 object-cover rounded-md mr-3">
                            <div>
                                <h4 class="font-semibold text-sm">${item.name}</h4>
                                <span class="text-xs text-gray-500">$${item.price.toFixed(2)} × ${item.quantity}</span>
                            </div>
                        </div>
                        <span class="font-semibold">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('');
    }

    // Update counts and totals
    updateTotals();
}

// Remove item from cart
function removeFromCart(id) {
    // console.log("Item removed");
    const itemIndex = cart.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }

        updateCartUI();
        updateTrolleyWeight();
    }
}

// Update totals
function updateTotals() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;

    checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    checkoutTax.textContent = `$${tax.toFixed(2)}`;
    checkoutTotal.textContent = `$${total.toFixed(2)}`;
}

/// Update trolley weight using live ESP8266 data
async function updateTrolleyWeight() {
    const expectedWeight = cart.reduce((sum, item) => sum + (item.weight * item.quantity), 0); // in kg

    try {
        // Replace <ESP_IP> with actual IP of ESP8266
        const response = await fetch('http://192.168.201.189/get_weight');
        const data = await response.json();

        let actualWeightGrams = parseFloat(data.weight); // ESP sends in grams
        let actualWeight = actualWeightGrams / 1000.0; // Convert to kg

        // Update DOM
        expectedWeightElement.textContent = `${expectedWeight.toFixed(2)} kg`;
        actualWeightElement.textContent = `${actualWeight.toFixed(2)} kg`;

        // Update progress bar
        const percentage = expectedWeight > 0 ? Math.min(100, (actualWeight / expectedWeight) * 100) : 0;
        weightBar.style.width = `${percentage}%`;

        // Update status based on difference
        const weightDifference = Math.abs(expectedWeight - actualWeight);

        if (weightDifference > 0.3) {
            weightStatus.className = 'text-sm font-medium text-red-600';
            weightStatus.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i> Weight mismatch';
            weightBar.style.background = 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)';
        } else if (weightDifference > 0.1) {
            weightStatus.className = 'text-sm font-medium text-yellow-600';
            weightStatus.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i> Weight difference detected';
            weightBar.style.background = 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)';
        } else {
            weightStatus.className = 'text-sm font-medium text-green-600';
            weightStatus.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Weight verified';
            weightBar.style.background = 'linear-gradient(90deg, #10B981 0%, #059669 100%)';
        }

    } catch (error) {
        console.error("Error fetching weight from ESP8266:", error);
        weightStatus.className = 'text-sm font-medium text-gray-500';
        weightStatus.innerHTML = '<i class="fas fa-times-circle mr-1"></i> Could not read weight';
        actualWeightElement.textContent = `-- kg`;
        weightBar.style.width = `0%`;
        weightBar.style.background = '#ccc';
    }
}


// Play success sound
function playSuccessSound() {
    const audio = new Audio('scan_success.mp3');
    audio.play();
}

// Show notification for product added
function showProductAddedNotification(productName) {
    console.log(`Added ${productName} to cart`);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initScanner();
    updateCartUI();

    // Added event listeners to remove buttons
    cartItems.addEventListener('click', function (e) {
        console.log("Item removed");
        if (e.target.closest('.remove-item')) {
            const id = e.target.closest('.remove-item').dataset.id;
            removeFromCart(id);
        }
    });

    // Event listener for checkout button
    completeCheckoutButton.addEventListener('click', () => {
        if (cart.length > 0) {
            successModal.classList.remove('hidden');
        } else {
            alert('Please add items to your cart before checkout.');
        }
    });

    // Event listeners for modal
    closeModalButton.addEventListener('click', () => {
        successModal.classList.add('hidden');
    });

    continueShoppingButton.addEventListener('click', () => {
        successModal.classList.add('hidden');
        cart = [];
        updateCartUI();
        updateTrolleyWeight();
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});