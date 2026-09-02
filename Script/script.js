import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

async function main() {
  const interaction = await ai.interactions.create({
    model: "gemini-3.7-flash",
    input: "Explain how AI works in a few words",
  });
  console.log(interaction.output_text);
}

main();
// Expanded Database of Kiosk Menu Items

const menuData = [
    // --- HOT COFFEE ---
    { id: s, name: "Espresso", category: "hot", price: 3.50, desc: "Rich double shot espresso.", available: true },
    { id: s, name: "Cappuccino", category: "hot", price: 4.75, desc: "Espresso with steamed milk foam.", available: true },
    { id: s, name: "Caffè Latte", category: "hot", price: 4.50, desc: "Espresso with silky steamed milk.", available: true },
    { id: 4, name: "Caffè Americano", category: "hot", price: 3.75, desc: "Espresso shots topped with hot water.", available: true },
    { id: 5, name: "Hazelnut Mocha", category: "hot", price: 5.25, desc: "Espresso with dark chocolate & hazelnut.", available: true },
    { id: 6, name: "Flat White", category: "hot", price: 4.85, desc: "Microfoam poured over double espresso.", available: true },
    { id: 7, name: "Caramel Macchiato", category: "hot", price: 5.50, desc: "Steamed milk with vanilla & caramel drizzle.", available: false }, // Out of stock example

    // --- ICED COFFEE & DRINKS ---
    { id: 8, name: "Iced Vanilla Latte", category: "cold", price: 5.25, desc: "Espresso over ice with milk & vanilla.", available: true },
    { id: 9, name: "Cold Brew", category: "cold", price: 4.50, desc: "Steeped smooth 12-hour cold coffee.", available: false }, // Out of stock example
    { id: 10, name: "Iced Caramel Macchiato", category: "cold", price: 5.75, desc: "Espresso, cold milk & caramel drizzle.", available: true },
    { id: 11, name: "Iced Americano", category: "cold", price: 4.00, desc: "Espresso shots poured over chilled ice.", available: true },
    { id: 12, name: "Iced Mocha", category: "cold", price: 5.50, desc: "Espresso, rich chocolate sauce & cold milk.", available: true },
    { id: 13, name: "Iced Matcha Latte", category: "cold", price: 5.50, desc: "Japanese green tea matcha over cold milk.", available: true },

    // --- BAKERY & PASTRIES ---
    { id: 14, name: "Almond Croissant", category: "bakery", price: 4.00, desc: "Flaky pastry with sweet almond filling.", available: true },
    { id: 15, name: "Blueberry Muffin", category: "bakery", price: 3.25, desc: "Fresh daily with sweet blueberries.", available: false }, // Out of stock example
    { id: 16, name: "Butter Croissant", category: "bakery", price: 3.50, desc: "Classic crisp, buttery French croissant.", available: true },
    { id: 17, name: "Chocolate Brownie", category: "bakery", price: 3.75, desc: "Fudgy chocolate brownie with choc chips.", available: true },
    { id: 18, name: "Cinnamon Roll", category: "bakery", price: 4.25, desc: "Warm roll with cream cheese icing.", available: true },
    { id: 19, name: "Avocado Toast", category: "bakery", price: 6.50, desc: "Toasted sourdough with seasoned avocado.", available: true }
];

let cart = [];

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const menuGrid = document.getElementById('menuGrid');
const navItems = document.querySelectorAll('.nav-item');
const totalPriceEl = document.getElementById('totalPrice');
const cartCountBadge = document.getElementById('cartCountBadge');
const checkoutBtn = document.getElementById('checkoutBtn');
const cancelOrderBtn = document.getElementById('cancelOrderBtn');

// Modals
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const modalTotal = document.getElementById('modalTotal');

const ticketModal = document.getElementById('ticketModal');
const confirmedTicketNumber = document.getElementById('confirmedTicketNumber');
const ticketDetails = document.getElementById('ticketDetails');
const doneTicketBtn = document.getElementById('doneTicketBtn');

// Toast Notification Container
let toastContainer = document.getElementById('toastContainer');
if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    document.body.appendChild(toastContainer);
}

function showNotification(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Start Screen Flow
welcomeScreen.addEventListener('click', () => {
    welcomeScreen.classList.add('hidden');
    resetKiosk();
});

function returnToWelcomeScreen() {
    resetKiosk();
    welcomeScreen.classList.remove('hidden');
}

// Render Menu based on selected Category and Item Availability
function renderCategoryMenu(category) {
    const filteredItems = menuData.filter(item => item.category === category);
    
    menuGrid.innerHTML = '';
    filteredItems.forEach(item => {
        const cartItem = cart.find(c => c.id === item.id);
        const quantity = cartItem ? cartItem.quantity : 0;

        const card = document.createElement('div');
        card.className = `menu-card ${!item.available ? 'out-of-stock' : ''}`;
        
        let actionHTML = '';

        if (!item.available) {
            actionHTML = `<button class="btn-unavailable" disabled>Sold Out</button>`;
        } else if (quantity > 0) {
            actionHTML = `
                <div class="qty-controller">
                    <button class="btn-qty" onclick="changeQuantity(${item.id}, -1)">-</button>
                    <span class="qty-count">${quantity}</span>
                    <button class="btn-qty" onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
            `;
        } else {
            actionHTML = `<button class="btn-add" onclick="addToCart(${item.id})">+ Add to Order</button>`;
        }

        const badgeHTML = !item.available ? `<span class="badge-out">Out of Stock</span>` : '';

        card.innerHTML = `
            <div>
                ${badgeHTML}
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <p class="price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="card-actions">${actionHTML}</div>
        `;
        menuGrid.appendChild(card);
    });
}

// Category Sidebar Handler
navItems.forEach(btn => {
    btn.addEventListener('click', (e) => {
        navItems.forEach(b => b.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        
        const category = target.getAttribute('data-category');
        renderCategoryMenu(category);
    });
});

// Cart Actions
function addToCart(id) {
    const product = menuData.find(p => p.id === id);
    if (!product || !product.available) return;

    cart.push({ ...product, quantity: 1 });
    updateCart();
}

function changeQuantity(id, amt) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += amt;
    if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);

    updateCart();
}

function updateCart() {
    const activeBtn = document.querySelector('.nav-item.active');
    const category = activeBtn ? activeBtn.getAttribute('data-category') : 'hot';
    renderCategoryMenu(category);

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCountBadge.textContent = totalCount;
    totalPriceEl.textContent = totalPrice.toFixed(2);
    checkoutBtn.disabled = cart.length === 0;
}

// Checkout & Ticket Generation
checkoutBtn.addEventListener('click', () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    modalTotal.textContent = total.toFixed(2);
    checkoutModal.classList.remove('hidden');
});

closeCheckoutModal.addEventListener('click', () => checkoutModal.classList.add('hidden'));

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dining = document.querySelector('input[name="diningOption"]:checked').value;
    const payment = document.querySelector('input[name="paymentMethod"]:checked').value;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    const ticketNo = `#DG-${Math.floor(1000 + Math.random() * 9000)}`;

    checkoutModal.classList.add('hidden');

    confirmedTicketNumber.textContent = ticketNo;
    ticketDetails.innerHTML = `
        <p><strong>Option:</strong> ${dining}</p>
        <p><strong>Payment:</strong> ${payment}</p>
        <p><strong>Total Due:</strong> $${total}</p>
    `;

    ticketModal.classList.remove('hidden');
    showNotification(`Order Confirmed! Ticket ${ticketNo} generated.`);
});

function resetKiosk() {
    cart = [];
    checkoutModal.classList.add('hidden');
    ticketModal.classList.add('hidden');
    checkoutForm.reset();
    
    navItems.forEach(b => b.classList.remove('active'));
    navItems[0].classList.add('active');
    
    updateCart();
}

cancelOrderBtn.addEventListener('click', returnToWelcomeScreen);
doneTicketBtn.addEventListener('click', returnToWelcomeScreen);

// Initial Load
renderCategoryMenu('hot');