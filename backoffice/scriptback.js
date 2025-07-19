  // Attendre que le DOM soit complètement chargé
  document.addEventListener('DOMContentLoaded', () => {
    // On attache l'écouteur au clic sur le bouton "add-product"
    document.getElementById('add-product').addEventListener('click', showAddProductForm);
  });

  // Fonction pour afficher le formulaire de création de produit
  async function showAddProductForm() {
    try {
      // Récupération des catégories pour le select
      const response = await fetch('https://wacdoapi.online/typeProducts');
      const data = await response.json();

      // Insertion du formulaire dans le conteneur
      const container = document.getElementById('showAddProductForm');
      container.innerHTML = `
        <form id="addProductForm">
          <label for="productName">Product Name:</label>
          <input type="text" id="productName" name="productName" required>
  
          <label for="productPrice">Product Price:</label>
          <input type="number" id="productPrice" name="productPrice" required>
  
          <label for="productDescription">Product Description:</label>
          <textarea id="productDescription" name="productDescription" required></textarea>
  
          <label for="productImage">Product Image URL:</label>
          <input type="url" id="productImage" name="productImage">
  
          <label for="productCategory">Product Category:</label>
          <select id="productCategory" name="productCategory" required></select>
  
          <button id="ajouter-produit" type="button">Ajouter un produit</button>
        </form>
      `;

      // Remplissage du <select> avec les catégories récupérées
      const selectElement = document.getElementById('productCategory');
      data.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;             // Valeur correspondant à l'ID
        option.textContent = category.type_name;  // Texte affiché
        selectElement.appendChild(option);
      });

      // Attache l'écouteur pour envoyer le formulaire après sa création
      document.getElementById('ajouter-produit').addEventListener('click', handleAddProduct);

    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    }
  }

  // Fonction pour traiter l'envoi du formulaire
  async function handleAddProduct(event) {
    event.preventDefault(); // Empêche le rechargement de la page
    
    const form = document.getElementById('addProductForm');
    // Convertir les données du formulaire en objet
    const formObject = Object.fromEntries(new FormData(form));

    // Construction de l'objet produit dans le format attendu par l'API
    const produit = {
      name: formObject.productName,
      description: formObject.productDescription,
      price: Number(formObject.productPrice),         // Conversion en nombre
      dispo: true,                                      // Valeur par défaut à true
      type: parseInt(formObject.productCategory, 10),   // Conversion de l'ID de la catégorie en entier
      image: formObject.productImage || null            // null si aucune image n'est renseignée
    };

    const jsonData = JSON.stringify(produit);
    console.log("JSON à envoyer :", jsonData);

    try {
      const response = await fetch('https://wacdoapi.online/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonData
      });

      if (response.ok) {
        alert('Produit ajouté avec succès !');
        form.reset();
      } else {
        console.error('Erreur lors de l\'ajout du produit. Code :', response.status);
        alert('Erreur lors de l\'ajout du produit.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
    }
  }