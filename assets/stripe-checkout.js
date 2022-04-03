import STRIPE_KEYS from "./stripe-keys.js";

//console.log(stripeKeys);

const d = document,
    $products = d.getElementById("products"),
    $template = d.getElementById("product-template").contentEditable,
    $fragment = d.createDocumentFragment(),
    fetchOptions = {
        headers: {
            Authorization: `Bearer ${STRIPE_KEYS.secret}`,
        },
    };

let prices, products;

// pedir mis datos usando la API ajax fetch usando mi clave secreta de la API stripe
Promise.all([
    fetch("https://api.stripe.com/v1/products", fetchOptions),
    fetch("https://api.stripe.com/v1/prices", fetchOptions),
])
    .then((responses) => Promise.all(responses.map((res) => res.json())))
    .then((json) => {
        console.log(json);
    })
    .catch((err) => {
        let message =
            err.statusText ||
            "Ocurrio un error al conectarse con la API Stripe";
        $products.innerHTML = `${message}: ${err.status}`;
    });
