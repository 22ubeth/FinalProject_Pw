document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Oli Ultra", img: "1.jpg", price: 50000 },
      { id: 2, name: "Oli MPX2", img: "2.jpg", price: 60000 },
      { id: 3, name: "Oli Xtren", img: "3.jpg", price: 45000 },
      { id: 4, name: "Ban YMH", img: "4.jpg", price: 200000 },
      { id: 5, name: "Ban IRC", img: "5.jpg", price: 300000 },
      { id: 6, name: "Ban FDR ", img: "6.jpg", price: 250000 },
      { id: 7, name: "Led", img: "7.jpg", price: 50000 },
      { id: 8, name: "Bohlam", img: "8.jpg", price: 10000 },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      // cek apakah ada barang yg sama di chart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // jika belum ada / chart masih kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // jika barang sudah ada, cek apakah barang beda atau sama dengan yang ada di chart
        this.items = this.items.map((item) => {
          // jika barang berbeda
          if (item.id !== newItem.id) {
            return item;
          } else {
            // jika barang sudah ada, tambah quantity dan totalnya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },

    remove(id) {
      // ambil item yg mau di remove berdasarkan id
      const cartItem = this.items.find((item) => item.id === id);

      //jika item lebih dari 1
      if (cartItem.quantity > 1) {
        // telusuri 1 1
        this.items = this.items.map((item) => {
          // jika bukan barang yg diklik
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        //jika barangnya sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },
  });
});

// form validasi
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
      checkoutButton.classList.add("disabled");
    } else {
      return false;
    }
  }
  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

//  kirim data ketika checkout di klik
checkoutButton.addEventListener('click', async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  //const message = formatMessage(objData);
  //window.open('http://wa.me/6285221816515?text=' + encodeURIComponent(mesage));


  // minta transaksi
try{
  const response = await fetch('php/placeOrder.php', {
    method: 'POST',
    body: data,
  });

  const token = await response.text();
  //console.log(token);
  window.snap.pay(token);
} catch (err) {
  console.log(err.message);
}
  
});

// form format wa
const formatMessage = (obj) => {
  return `Data Customer
    Nama: ${obj.name}
    Email: ${obj.email}
    No Hp: ${obj.phone}

Data Pesanan
    ${JSON.parse(obj.items).map(
      (item) => `${item.name} (${item.quantity} X ${rupiah(item.total)}) \n`
    )}
    TOTAL: ${rupiah(obj.total)}
    Terima Kasih.`;
};

//konversi ke rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
