const TAX_RATE = 0.1;

const coffeeMenu = [
  {
    id: "flat-white",
    name: "Flat White",
    category: "espresso",
    description: "Mikro köpüklü süt ile dengelenmiş çift shot espresso.",
    price: 78.0,
    image: "assets/images/coffee/Flat White.webp"
  },
  {
    id: "caramel-latte",
    name: "Karamel Latte",
    category: "espresso",
    description: "Karamel sos, süt ve espresso ile tatlı bir ritüel.",
    price: 82.5,
    image: "assets/images/coffee/Karamel Latte.jpg.webp"
  },
  {
    id: "americano",
    name: "Americano",
    category: "espresso",
    description: "Sıcak su ile dengelenmiş yoğun espresso.",
    price: 58.0,
    image: "assets/images/coffee/Americano.jpg.webp"
  },
  {
    id: "v60",
    name: "V60 El Demleme",
    category: "brew",
    description: "Tek kökenli çekirdek, manuel olarak V60 ile demlenir.",
    price: 92.5,
    image: "assets/images/coffee/El Demleme.jpg.webp"
  },
  {
    id: "chemex",
    name: "Chemex",
    category: "brew",
    description: "Berrak gövdeli, çiçeksi notalara sahip demleme deneyimi.",
    price: 96.0,
    image: "assets/images/coffee/Chemex.jpg"
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    category: "cold",
    description: "18 saat soğukta demlenmiş kahve, buz üzerinde servis.",
    price: 88.0,
    image: "assets/images/coffee/Cold Brew.jpeg"
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    category: "cold",
    description: "Espresso ve süt buzlu cam bardağı buluşuyor.",
    price: 76.0,
    image: "assets/images/coffee/Iced Latte.jpg.webp"
  },
  {
    id: "affogato",
    name: "Affogato",
    category: "dessert",
    description: "Vanilyalı dondurma üzerine sıcak espresso dökümü.",
    price: 68.0,
    image: "assets/images/coffee/Affogato.jpg"
  },
  {
    id: "brownie",
    name: "Espresso Brownie",
    category: "dessert",
    description: "Yoğun çikolata ve espresso aromalı brownie dilimi.",
    price: 64.5,
    image: "assets/images/coffee/Espresso Brownie.jpg"
  },
  {
    id: "granola",
    name: "Bademli Granola Bardak",
    category: "dessert",
    description: "Bademli granola, yoğurt ve bal ile hafif öğün.",
    price: 56.5,
    image: "assets/images/coffee/Bademli Granola Bardak.jpg"
  }
];

const categoryLabels = {
  all: "Tümü",
  espresso: "Espresso Bazlı",
  brew: "Demleme",
  cold: "Soğuk Kahve",
  dessert: "Tatlı & Atıştırmalık"
};

const FALLBACK_IMAGE = "assets/images/placeholder.svg";
const cart = new Map();

const menuGrid = document.getElementById("menu-grid");
const filterButtons = document.querySelectorAll(".filter-button");
const cartItemsContainer = document.getElementById("cart-items");
const cartItemTemplate = document.getElementById("cart-item-template");
const subtotalElement = document.getElementById("subtotal");
const taxElement = document.getElementById("tax");
const totalElement = document.getElementById("total");
const checkoutNote = document.getElementById("checkout-note");
const paymentForm = document.getElementById("payment-form");

function renderMenu(filter = "all") {
  menuGrid.innerHTML = "";
  const filteredItems =
    filter === "all"
      ? coffeeMenu
      : coffeeMenu.filter((item) => item.category === filter);

  if (filteredItems.length === 0) {
    const message = document.createElement("p");
    message.className = "cart-empty";
    message.textContent = "Bu kategoriye ait ürün bulunamadı.";
    menuGrid.appendChild(message);
    return;
  }

  for (const item of filteredItems) {
    menuGrid.appendChild(createMenuCard(item));
  }
}

function createMenuCard(item) {
  const card = document.createElement("article");
  card.className = "menu-card";
  card.dataset.itemId = item.id;

  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.name;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    image.src = FALLBACK_IMAGE;
  });
  card.appendChild(image);

  const name = document.createElement("h3");
  name.textContent = item.name;
  card.appendChild(name);

  const description = document.createElement("p");
  description.textContent = item.description;
  card.appendChild(description);

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const category = document.createElement("span");
  category.className = "badge";
  category.textContent = categoryLabels[item.category] || "";

  const price = document.createElement("span");
  price.className = "price-tag";
  price.textContent = formatCurrency(item.price);

  const button = document.createElement("button");
  button.className = "add-button";
  button.type = "button";
  button.textContent = "Sepete Ekle";
  button.addEventListener("click", () => addToCart(item.id));

  footer.appendChild(price);
  footer.appendChild(button);

  card.appendChild(category);
  card.appendChild(footer);

  return card;
}

function addToCart(itemId) {
  checkoutNote.textContent = "";
  const item = coffeeMenu.find((menuItem) => menuItem.id === itemId);
  if (!item) return;

  const existing = cart.get(itemId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.set(itemId, { ...item, quantity: 1 });
  }

  renderCart();
  announce(`${item.name} sepete eklendi.`);
}

function renderCart() {
  cartItemsContainer.innerHTML = "";

  if (cart.size === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "cart-empty";
    emptyState.textContent = "Sepetin boş. Kahve seçerek başla.";
    cartItemsContainer.appendChild(emptyState);
    updateSummary();
    return;
  }

  for (const [itemId, cartItem] of cart.entries()) {
    const cartNode = cartItemTemplate.content.firstElementChild.cloneNode(true);
    cartNode.dataset.itemId = itemId;

    const nameElement = cartNode.querySelector(".item-name");
    const optionElement = cartNode.querySelector(".item-options");
    const priceElement = cartNode.querySelector(".item-price");
    const quantityElement = cartNode.querySelector(".item-quantity");
    const decreaseButton = cartNode.querySelector(".decrease");
    const increaseButton = cartNode.querySelector(".increase");
    const removeButton = cartNode.querySelector(".remove-button");

    nameElement.textContent = cartItem.name;
    optionElement.textContent = categoryLabels[cartItem.category] || "";
    priceElement.textContent = formatCurrency(cartItem.price * cartItem.quantity);
    quantityElement.textContent = String(cartItem.quantity);

    decreaseButton.addEventListener("click", () =>
      updateQuantity(itemId, cartItem.quantity - 1)
    );
    increaseButton.addEventListener("click", () =>
      updateQuantity(itemId, cartItem.quantity + 1)
    );
    removeButton.addEventListener("click", () => removeFromCart(itemId));

    cartItemsContainer.appendChild(cartNode);
  }

  updateSummary();
}

function updateQuantity(itemId, newQuantity) {
  const item = cart.get(itemId);
  if (!item) return;

  const previousQuantity = item.quantity;

  if (newQuantity <= 0) {
    cart.delete(itemId);
    announce(`${item.name} sepetten çıkarıldı.`);
  } else {
    item.quantity = newQuantity;
    if (newQuantity > previousQuantity) {
      announce(`${item.name} adedi ${newQuantity} olarak artırıldı.`);
    } else if (newQuantity < previousQuantity) {
      announce(`${item.name} adedi ${newQuantity} olarak azaltıldı.`);
    }
  }

  renderCart();
}

function removeFromCart(itemId) {
  const item = cart.get(itemId);
  if (!item) return;
  cart.delete(itemId);
  renderCart();
  announce(`${item.name} sepetten kaldırıldı.`);
}

function updateSummary() {
  let subtotal = 0;

  for (const item of cart.values()) {
    subtotal += item.price * item.quantity;
  }

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  subtotalElement.textContent = formatCurrency(subtotal);
  taxElement.textContent = formatCurrency(tax);
  totalElement.textContent = formatCurrency(total);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY"
  }).format(value);
}

function announce(message) {
  const liveRegion =
    document.getElementById("live-region") || createLiveRegion();
  liveRegion.textContent = "";
  window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}

function createLiveRegion() {
  const liveRegion = document.createElement("div");
  liveRegion.id = "live-region";
  liveRegion.className = "sr-only";
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("role", "status");
  document.body.appendChild(liveRegion);
  return liveRegion;
}

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (cart.size === 0) {
    checkoutNote.style.color = "#d97706";
    checkoutNote.textContent = "Ödeme için önce kahve seçmelisin.";
    return;
  }

  const formData = new FormData(paymentForm);
  const method = formData.get("payment");

  const methodMessages = {
    pos: "Baristamız temassız POS ile ödeme alacak.",
    cash: "Kasada nakit ödeme yapabilirsiniz.",
    qr: "QR kodu tarayarak mobil bankacılık ile ödeyebilirsiniz."
  };

  checkoutNote.style.color = "#0d9488";
  checkoutNote.textContent = methodMessages[method] || "Ödeme talebiniz alındı.";

  cart.clear();
  renderCart();
  paymentForm.reset();
  paymentForm.querySelector('input[value="pos"]').checked = true;
});

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    setActiveFilter(button);
    renderMenu(button.dataset.filter);
  });
}

function setActiveFilter(activeButton) {
  for (const button of filterButtons) {
    button.classList.toggle("is-active", button === activeButton);
  }
}

renderMenu("all");
renderCart();
