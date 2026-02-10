const url = "http://127.0.0.1:5501/FrontEnd/index.html";
const urlParams = new URLSearchParams(window.location.search);

// fetch the request url and return content
async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("error fetching data : " + error.message);
    return false;
  }
}

// get works from api and add them to DOM
async function loadWorks() {
  const worksContainer = document.querySelector(".gallery");
  const works = await fetchData("http://localhost:5678/api/works");

  // create all works from api and add it to the dom
  if (works) {
    works.forEach((work) => {
      let figure = document.createElement("figure");
      let image = document.createElement("img");
      let caption = document.createElement("figcaption");

      figure.dataset.id = work.id;
      figure.dataset.category = work.categoryId;
      figure.id = "work-" + work.id;

      image.src = work.imageUrl;
      image.alt = work.title;

      caption.innerText = work.title;

      figure.appendChild(image);
      figure.appendChild(caption);

      worksContainer.appendChild(figure);
    });
  } else {
    console.warn("works is not valid");
    return;
  }
}

// get filters from api and add them to DOM
async function loadFilters() {
  const filtersContainer = document.querySelector(".filters");
  const filters = await fetchData("http://localhost:5678/api/categories");

  // the tous btn is already in dom so we just add the event listener
  const tousBtn = document.getElementById("tous");
  tousBtn.addEventListener("click", handleFilterChange);

  // create all the filter btn from api and add it to the dom
  if (filters) {
    filters.forEach((filter) => {
      let btn = document.createElement("button");
      btn.innerText = filter.name;
      btn.id = filter.id;
      btn.classList = "filter";
      btn.addEventListener("click", handleFilterChange);

      filtersContainer.appendChild(btn);
    });
  } else {
    console.warn("filters is not valid");
    return;
  }
}

async function loadCreateModale() {
  const categories = await fetchData("http://localhost:5678/api/categories");
  const categoriesSelect = document.querySelector("#categoryForm");
  const form = document.querySelector("#galleryAddForm");
  let imagePreview = document.querySelector("#imagePreview");
  let fileImage = document.querySelector("#file");

  // file droping logic
  function initFile() {
    let fileBtn = document.querySelector("#fileBtn");
    let fileInput = document.querySelector("#fileInput");

    // file input is mapped to html
    fileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      fileInput.click();
    });

    // when the user select an image we show it
    fileInput.addEventListener("change", () => {
      let file = fileInput.files[0];
      let url = window.URL.createObjectURL(file);
      let img = document.createElement("img");

      if (file.size > 4 * 1024 * 1024) {
        fileInput.value = "";
        document.querySelector("#error").className = "error";
        return;
      }

      document.querySelector("#error").className = "hide";

      img.src = url;

      fileImage.className = "hide";
      imagePreview.className = "image";

      imagePreview.appendChild(img);
    });
  }

  if (categories) {
    // load all categories
    categories.forEach((categorie, index) => {
      let newCategorie = document.createElement("option");
      newCategorie.value = categorie.id;
      newCategorie.innerText = categorie.name;

      categoriesSelect.appendChild(newCategorie);
    });

    initFile();

    // when form is submited we post it to the api
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const session = window.localStorage.getItem("session");

      // update object in backend
      const response = await fetch(`http://localhost:5678/api/works/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${session}`,
        },
      });

      // check if upload work
      if (!response.ok) {
        console.error("error posting work : " + response.status);
        return;
      }

      form.reset();

      // close the modal
      document.getElementById("edit").classList = "hide";

      // close the image preview
      fileImage.className = "image";
      imagePreview.className = "hide";

      // create the new work
      const data = await response.json();
      const worksContainer = document.querySelector(".gallery");
      let figure = document.createElement("figure");
      let image = document.createElement("img");
      let caption = document.createElement("figcaption");

      figure.dataset.id = data.id;
      figure.dataset.category = data.categoryId;
      figure.id = "work-" + data.id;

      image.src = data.imageUrl;
      image.alt = data.title;

      caption.innerText = data.title;

      figure.appendChild(image);
      figure.appendChild(caption);

      worksContainer.appendChild(figure);

      // response
      document.getElementById("work-" + data.id).scrollIntoView()
    });
  } else {
    console.warn("categories in create modal is not valid");
    return;
  }
}

// this function take a event as params or id direcly
function handleFilterChange(e) {
  // id origin change if arg is event or direct id
  const id = e.target ? e.target.id : e;

  // get all the currents filters from dom and slice them into array
  const filters = Array.prototype.slice.call(
    document.querySelectorAll(".filter"),
  );
  const figures = Array.from(document.querySelectorAll(`[data-category]`));

  // change class of filters btn
  filters.forEach((filter) => {
    filter.classList = "filter";

    if (filter.id == id) {
      filter.classList = "filter filter--active";
    }
  });

  // reset any old class from figures and add class hide to all figures not matching category
  figures.forEach((figure) => {
    figure.classList = "";

    if (figure.dataset.category !== id && id !== "tous") {
      figure.classList = "hide";
    }
  });

  // change the url param to the new selected filter
  urlParams.set("filter", id);
  window.history.replaceState({}, "", `${url}?${urlParams}`);
}

// remove session and hide all admin parts without reloading page
function handleLogout() {
  localStorage.removeItem("session");

  document.getElementById("login").classList = "";
  document.getElementById("logout").classList = "hide";
  document.getElementById("editBtn").classList = "hide";
  document.getElementById("editmode").classList = "hide";
  document.getElementById("filters").classList = "filters";
}

async function handleShowModale(arg) {

  if (arg) {
    
  } else {

  }

  // get the work from api
  const list = document.querySelector(".galleryEdit__content");
  const works = await fetchData("http://localhost:5678/api/works");

  if (works) {
    // show the edit section
    document.getElementById("edit").classList = "";
    document.getElementById("galleryEdit").classList = "galleryEdit";
    document.getElementById("galleryAdd").classList = "galleryAdd hide";

    // reset any old content
    list.innerHTML = "";

    // create all works from api and add it to the dom
    works.forEach((work) => {
      let card = document.createElement("div");
      let image = document.createElement("img");
      let btn = document.createElement("button");
      let ico = document.createElement("i");
      card.classList = "galleryEdit__card";
      card.id = "modal-" + work.id;

      ico.classList = "fa-solid fa-trash-can";
      ico.id = work.id;

      image.src = work.imageUrl;

      btn.id = work.id;
      btn.addEventListener("click", async (e) => {
        const session = window.localStorage.getItem("session");
        const id = e.target.id;

        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
          method: "DELETE",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${session}`,
          },
        });

        if (response.ok) {
          let deletedImageModal = document.querySelector("#modal-" + work.id);
          deletedImageModal.remove();

          let deletedWork = document.querySelector("#work-" + work.id);
          deletedWork.remove();
        } else {
          console.error("error deleting work : " + response.status);
        }
      });

      btn.appendChild(ico);
      card.appendChild(image);
      card.appendChild(btn);

      list.appendChild(card);
    });

    // listener to show create modal when user press ajouter photo
    galleryAddBtn.addEventListener("click", () => {
      document.getElementById("edit").classList = "";
      document.getElementById("galleryEdit").classList = "galleryEdit hide";
      document.getElementById("galleryAdd").classList = "galleryAdd";
    });

    // in create modal back arrow to return to delete modal
    document
      .querySelector(".galleryAdd__back")
      .addEventListener("click", () => {
        document.getElementById("edit").classList = "";
        document.getElementById("galleryEdit").classList = "galleryEdit ";
        document.getElementById("galleryAdd").classList = "galleryAdd hide";
      });
  } else {
    console.warn("in showmodale works are not valid");
  }
}

// only call in one dom element to hide modale
function handleCloseModale() {
  document.getElementById("edit").classList = "hide";
}

// here we load all function and do stuff on page load
async function pageLoad() {
  const id = urlParams.get("filter");

  loadWorks();
  await loadFilters();
  loadCreateModale();

  // if we have an id from url params then we select it else we just use tous as default
  if (id) {
    handleFilterChange(id);
  } else {
    handleFilterChange("tous");
  }

  // hide login if user is sign in, hide logout if user is not sign in
  if (window.localStorage.getItem("session")) {
    document.getElementById("login").classList = "hide";
    document.getElementById("logout").classList = "";
    document.getElementById("editBtn").classList = "";
    document.getElementById("editmode").classList = "";
    document.getElementById("filters").classList = "hide";
  } else {
    document.getElementById("login").classList = "";
    document.getElementById("logout").classList = "hide";
    document.getElementById("editBtn").classList = "hide";
    document.getElementById("editmode").classList = "hide";
    document.getElementById("filters").classList = "filters";
  }
}

pageLoad();
