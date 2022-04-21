import STRIPE_KEYS from "./stripe-keys.js";

//console.log(stripeKeys);

const d = document,
    $dibujos = d.getElementById("dibujos"),
    $template = d.getElementById("dibujo-template").content,
    $fragment = d.createDocumentFragment(),
    fetchOptions = {
        headers: {
            Authorization: `Bearer ${STRIPE_KEYS.secret}`,
        },
    };

let products, prices;

// funcion para formatear el precio de los productos
const moneyFormat = (num) => `$${num.slice(0, -2)}.${num.slice(-2)}`;

// pedir mis datos usando la API ajax fetch usando mi clave secreta de la API stripe
Promise.all([
    fetch("https://api.stripe.com/v1/products", fetchOptions),
    fetch("https://api.stripe.com/v1/prices", fetchOptions),
])
    .then((responses) => Promise.all(responses.map((res) => res.json())))
    .then((json) => {
        // console.log(json);
        products = json[0].data;
        prices = json[1].data;
        console.log(products, prices);

        // recorrer el resultado
        prices.forEach((price) => {
            let productData = products.filter(
                (product) => product.id === price.product
            );
            console.log(productData);

            $template
                .querySelector(".dibujo")
                .setAttribute("data-price", price.id);
            $template.querySelector("img").src = productData[0].images[0];
            $template.querySelector("img").alt = productData[0].name;
            $template.querySelector("figcaption").innerHTML = `
                ${productData[0].name}
                <br>
                ${price.currency} ${moneyFormat(price.unit_amount_decimal)}
            `;

            let $clone = d.importNode($template, true);
            $fragment.appendChild($clone);
        });
        $dibujos.appendChild($fragment);
    })
    .catch((err) => {
        let message =
            err.statusText ||
            "Ocurrio un error al conectarse con la API Stripe";
        $dibujos.innerHTML = `${message}: ${err.status}`;
    });

d.addEventListener("click", (event) => {
    // si el click es la clase o cualquier cosa adentro
    if (event.target.matches(".dibujo *")) {
        // ir al elemento padre y obtener el data-price creado anteriormente
        let priceId = event.target.parentElement.getAttribute("data-price");
        // enviar el precio a stripe usando llave publica
        Stripe(STRIPE_KEYS.public)
            .redirectToCheckout({
                lineItems: [{ price: priceId, quantity: 1 }],
                mode: "subscription",
                // pagina de exito en local
                successUrl: "http://127.0.0.1:5500/stripe-success.html",
                // pagina de error
                cancelUrl: "",
            })
            // manipular el error
            .then((res) => {
                if (res.error) {
                    // insertar mensaje debajo de la imagen
                    $dibujos.insertAdjacentHTML("afterend", res.error.message);
                }
            });
    }
});
