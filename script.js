/* === page login.html === */
function login() {
  const mail = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const client = { mail, password };
  console.log(client);

  fetch("https://wacdoapi.online/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(client)
    
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Erreur de connexion");
    }
    return response.json();
  })
  .then(data => {
    //  Stocker name et lastName
    const { name, last_name, token } = data;
    localStorage.setItem("client",name + " " + last_name);
    console.log("Nom et prénom stockés dans le localStorage :", name, last_name);
    console.log("Token reçu :", token);

    //  Stocker le token
    localStorage.setItem("token", token);

    //  Décoder le token 
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;

    // 4. Redirection selon le rôle
    switch (role) {
      case 4:
        window.location.href = "selection.html";
        break;
      case 1:
        window.location.href = "manager.html";
        break;
      case 3:
        window.location.href = "preparateur.html";
        break;
      case 2:
        window.location.href = "Accueil.html";
        break;
      default:
        alert("Rôle inconnu");
    }
  })
  .catch(error => {
    alert(error.message);
  });
}


/* ===page selection.html ===*/
function choisiroption(selection) {
  // Enregistre la sélection dans le localStorage
  localStorage.setItem('selection', selection);

  // Redirige vers la page commande.html
  window.location.href = 'commande.html';
}

/*=== page commande.html === */

document.addEventListener("DOMContentLoaded", async () => {
  if(window.location.pathname.includes("commande.html")){
  const menu = document.getElementById("menu");
  const container = document.getElementById("product-container");
  let lastArticle;
  let lastArticleKey;

 

  // === DEFILEMENT DU MENU === //
  document.getElementById("left-arrow").addEventListener("click", () => {
    menu.scrollLeft -= 100;
  });
  document.getElementById("right-arrow").addEventListener("click", () => {
    menu.scrollLeft += 100;
  });


// === RECUPERATION DES CATEGORIES === //
  try {
    // Récupérer les catégories
    const categoriesResponse = await fetch("https://wacdoapi.online/typeProducts");
    const categories = await categoriesResponse.json();

    categories.forEach(category => {
      // Ignorer la catégorie avec l'ID 47
      if (category.id !== 47) {
        const catButton = document.createElement("button");
        catButton.innerHTML = `
          <img src="annexe/${category.image}" alt="${category.type_name}" class="image-menu">
          <br>
          ${category.type_name}
        `;
        catButton.classList.add("menu-button");
        catButton.dataset.category = category.id;


        // === CREATION DES BOUTONS === //
        catButton.addEventListener("click", async () => {
          try {
            const productsResponse = await fetch(`https://wacdoapi.online/products/type/${category.id}`);
            const products = await productsResponse.json();

            container.innerHTML = "";

            products.forEach(product => {
              const prodButton = document.createElement("button");
              prodButton.classList.add("product-button");
              prodButton.dataset.id = product.id;
              prodButton.innerHTML = `
                <img src="annexe/${product.image}" alt="${product.name}" class="image-product">
                <br>
                <p id="productName${product.id}">${product.name}</p>
                <br>
                <p id="PriceId${product.id}">${product.price} € </p>
              `;
              console.log(prodButton)
              // Clic Article
              prodButton.addEventListener("click", event => {
                console.log(event.currentTarget.dataset)
                const productId = event.currentTarget.dataset.id;
                const priceRaw = document.getElementById("PriceId"+productId).innerHTML;
                const priceId = priceRaw.replace("€", "").trim();
                const productName = document.getElementById("productName"+productId).innerHTML;
                console.log("Produit ID :", productId);
                console.log("Produit Nom :", productName);
                console.log("Produit Prix :", priceId);
                let ArticleObject = [{ "id": productId, "name": productName, "price": priceId }];
                console.log("Produit Array :", ArticleObject);

                // Enregistrement dans le localStorage
                const randomNum = Math.floor(Math.random() * 50) + 1;
                const ArticleKey = "Article" + randomNum;
                localStorage.setItem(ArticleKey, JSON.stringify(ArticleObject));
                console.log(`Produit enregistré sous "${ArticleKey}": ${ArticleObject}`);
                afficherPanier();
                lastArticle = localStorage.getItem(ArticleKey);
                lastArticleKey = ArticleKey;

                // === Gestion pop-up ===
                if (product.type) {
                  if (product.type.toString() === "1") {
                    openPopupMultiple(product);
                  } else if ([37, 38, 39, 40, 41, 29, 30, 31, 32, 33, 34, 35, 36, 44, 45].includes(parseInt(product.id))) {
                    openPopupSingle("https://wacdoapi.online/products", product);
                  } else {
                    calculerTotalPrixArticles(); // ✅ ICI il manquait
                  }
                } else {
                  calculerTotalPrixArticles();
                }

                
              });

              container.appendChild(prodButton);
            });
          } catch (error) {
            console.error("Erreur lors de la récupération des produits :", error);
          }
        });

        menu.appendChild(catButton);
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
  }

  // === POPUP MULTIPLE === //
  function openPopupMultiple(product) {
    let selectionCount = 0;
    const endpoints = [
      "https://wacdoapi.online/products/multi?ids=117,118",
      "https://wacdoapi.online/products/multi?ids=39,40",
      "https://wacdoapi.online/products/multi?ids=58,61",
      "https://wacdoapi.online/products/type/6",
      "https://wacdoapi.online/products/multi?ids=119,120"
    ];

    const fetchAndShow = async () => {
      try {
        const apiToCall = endpoints[selectionCount];
        const response = await fetch(apiToCall);
        const selectableProducts = await response.json();
        const popup = document.getElementById("popup");

        popup.innerHTML = `<button id="close-popup"><img class="close-button" src="./annexe/images/supprimer.png"></button><h3>Sélectionnez un produit (${selectionCount + 1}/5)</h3>`;

        selectableProducts.forEach(item => {
          const itemButton = document.createElement("button");
          itemButton.classList.add("popup-button");
          itemButton.dataset.id = item.id;
          itemButton.innerHTML = `
            <img src="annexe/${item.image}" alt="${item.name}" class="image-popup">
            <br>
            ${item.name} - ${item.price} €
          `;
          popup.appendChild(itemButton);
        });

        popup.classList.remove("hidden");

        document.getElementById("close-popup").addEventListener("click", () => {
          popup.classList.add("hidden");
        });

        const popupButtons = popup.querySelectorAll(".popup-button");
        popupButtons.forEach(popupBtn => {
          popupBtn.addEventListener("click", event => {
            const selectedId = event.currentTarget.dataset.id;
            const selectedName = event.currentTarget.innerText.split(" - ")[0].trim();

            const selectedProduct = {
              id: selectedId,
              name: selectedName,
            };
            let existingArticle = localStorage.getItem(lastArticleKey);
            let articleArray = [];

            if (existingArticle) {
              articleArray = JSON.parse(existingArticle);
            }
            articleArray.push(selectedProduct);
            localStorage.setItem(lastArticleKey, JSON.stringify(articleArray));

            console.log(`Produit sélectionné enregistré sous "${lastArticleKey}":`, articleArray);
            afficherPanier();
            selectionCount++;
            popup.innerHTML = "";
            if (selectionCount < endpoints.length) {
              fetchAndShow();
            } else {
              popup.classList.add("hidden");
              const totalPrix = calculerTotalPrixArticles();
              document.getElementById("order-total").textContent = totalPrix.toFixed(2) + " €";
              console.log("Prix total mis à jour :", totalPrix);
            }
          });
        });
      } catch (error) {
        console.error("Erreur dans openPopupMultiple :", error);
      }
    };

    fetchAndShow();
  }

  // === POPUP SIMPLE === //
  async function openPopupSingle(apiUrl, product) {
    try {
      let finalApiUrl = "";
      console.log("Produit ID :", product.id);
      if ([37, 38, 39, 40, 41].includes(product.id)) {
        finalApiUrl = "https://wacdoapi.online/products/multi?ids=58,61";
      } else if ([29, 30, 31, 32, 33, 34, 35, 36].includes(product.id)) {
        finalApiUrl = "https://wacdoapi.online/products/multi?ids=119,120";
      } else if ([44, 45].includes(product.id)) {
        finalApiUrl = "https://wacdoapi.online/products/type/9";
      }

      const response = await fetch(finalApiUrl);
      const selectableProducts = await response.json();

      const popup = document.getElementById("popup");
      popup.innerHTML = `<button id="close-popup"><img class="close-button" src="./annexe/images/supprimer.png"></button><h3>Sélectionnez un produit</h3>`;
      console.log("Produits sélectionnables :", selectableProducts);

      selectableProducts.forEach(item => {
        const itemButton = document.createElement("button");
        itemButton.classList.add("popup-button");
        itemButton.dataset.id = item.id;
        itemButton.innerHTML = `<img src="annexe${item.image}" alt="${item.name}" class="image-popup"><br>${item.name}`;
        popup.appendChild(itemButton);
      });

      popup.classList.remove("hidden");

      document.getElementById("close-popup").addEventListener("click", () => {
        popup.classList.add("hidden");
      });

      const popupButtons = popup.querySelectorAll(".popup-button");
      popupButtons.forEach(popupBtn => {
        popupBtn.addEventListener("click", event => {
          const selectedId = event.currentTarget.dataset.id;
          const selectedName = event.currentTarget.innerText.split(" - ")[0].trim();

          const selectedProduct = {
            id: selectedId,
            name: selectedName,
          };
          let existingArticle = localStorage.getItem(lastArticleKey);
          let articleArray = [];

          if (existingArticle) {
            articleArray = JSON.parse(existingArticle);
          }
          articleArray.push(selectedProduct);
          localStorage.setItem(lastArticleKey, JSON.stringify(articleArray));

          console.log(`Produit sélectionné enregistré sous "${lastArticleKey}":`, articleArray);
          afficherPanier();
          popup.classList.add("hidden");
          const totalPrix = calculerTotalPrixArticles();
          document.getElementById("order-total").textContent = totalPrix.toFixed(2) + " €";
          console.log("Prix total mis à jour :", totalPrix);
        });
      });
    } catch (error) {
      console.error("Erreur dans openPopupSingle :", error);
    }
  }

  //=== Panier ===//

  //ajout selection sur place ou a emporter
  const selection = localStorage.getItem('selection');
  const messageElement = document.getElementById('selection-type');

  if (selection === "2") {
    messageElement.textContent = " Sur place 🍽️";
  } else if (selection === "1") {
    messageElement.textContent = "À emporter 🛍️";
  } else {
    messageElement.textContent = "Aucune sélection détectée.";
  }

  //calcul prix total 
  function calculerTotalPrixArticles() {
    let total = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log("Clé :", key);
      console.log("Valeur :", localStorage.getItem(key));

      if (key.startsWith("Article")) {
        const articleData = JSON.parse(localStorage.getItem(key));
        console.log("Article Data :", articleData);

        articleData.forEach(article => {
          if (article.price) {
            total += parseFloat(article.price);
            console.log("Prix de l'article :", article.price);
            console.log("Prix total actuel :", total);
          } else {
            console.warn("Article sans prix :", article);
          }
        });
      }
    }

    document.getElementById("order-total").textContent = total.toFixed(2) + " €";
    console.log("Prix total mis à jour :", total);
    return total;
  }

  calculerTotalPrixArticles();
  afficherPanier();
}});

//affichage des article du panier 

function afficherPanier() {
  const panierList = document.getElementById("panier-list");
  panierList.innerHTML = ""; // Nettoie le panier

  // Parcours toutes les clés 
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.startsWith("Article")) {
      const articleData = JSON.parse(localStorage.getItem(key));

      if (Array.isArray(articleData) && articleData.length > 0) {
        const ul = document.createElement("ul");
        ul.classList.add("article-block");

        // Affiche le produit principal dans un h2 
        const liTitle = document.createElement("li");
        liTitle.classList.add("li-title");
        liTitle.innerHTML = `<h2>${articleData[0].name}</h2>`;
        ul.appendChild(liTitle);

        // Affiche les composants 
        for (let j = 1; j < articleData.length; j++) {
          const li = document.createElement("li");
          li.classList.add("li-component");
          li.textContent = articleData[j].name;
          ul.appendChild(li);
        }

        // Ajoute ce bloc au panier général
        panierList.appendChild(ul);
      }
    }
  }
}
// renvoi vers la fin ou le chevalet suivant la selection
function redirigerVersChevalet() {
  const selection = localStorage.getItem('selection');
  if (selection === "2") {
    window.location.href = 'chevalet.html';
  } else {
    window.location.href = 'fin.html';
  }
  savetotal();
  console.log("total enregistrer :", localStorage.getItem('total'));
};
 // Vide le localStorage à chaque refresh
function abandon() {
  localStorage.clear();
  window.location.href = 'index.html';
};

function savetotal() {
  const total = document.getElementById("order-total").textContent;
  localStorage.setItem('total', total);
  console.log("Total enregistré :", total);
}


// === PAGE CHEVALET ===//
//ecriture du code chevalet
function moveToNext(current, nextId) {

  current.value = current.value.replace(/[^0-9]/g, '');

  if (current.value.length === 1 && nextId) {
    document.getElementById(nextId).focus();
  }};

// Fonction pour récupérer et calculer le code
function getCode() {
  const d1 = document.getElementById('n1').value;
  const d2 = document.getElementById('n2').value;
  const d3 = document.getElementById('n3').value;

  // Concaténation et conversion en nombre entier
  const code = parseInt(d1 + d2 + d3, 10);
  console.log("Code du chevalet :", code);

  return code;
}

// Fonction pour enregistrer et rediriger
function addchevalet() {
  const code = getCode(); // on récupère le code ici
  localStorage.setItem('chevalet', code);
  window.location.href = 'fin.html';
}

let commande;

function envoiCommande() {
  commande = {
    selection: parseInt(localStorage.getItem('selection')),
    chevalet: parseInt(localStorage.getItem('chevalet')),
    total: parseFloat(localStorage.getItem('total')),
    client: localStorage.getItem('client'),
    articles: []
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("Article")) {
      const articleData = JSON.parse(localStorage.getItem(key));

      for (let j = 0; j < articleData.length; j++) {
        const article = {
          id: parseInt(articleData[j].id),
        };
        commande.articles.push(article);
      }
    }
  }

  // ✅ Envoi de la commande UNE SEULE FOIS ici, hors des boucles
  console.log("Commande finale à envoyer :", commande);

  fetch("https://wacdoapi.online/commands", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commande)
  })
  .then(response => response.json())
  .then(data => {
    console.log("Réponse du serveur :", data);
  })
  .catch(error => {
    console.error("Erreur lors de l'envoi de la commande :", error);
  });
}

// Envoi automatique à l'ouverture de la page fin.html
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("fin.html")) {
    envoiCommande();
  }
});


  