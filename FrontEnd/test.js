const formData = new FormData();
formData.append("image", image);
formData.append("title", title);
formData.append("category", category);
const upload = await fetch(works, {
  method: "POST",
  headers: {
    Accept: "application/json",
    Authorization: "Bearer " + sessionStorage.getItem("token"),
  },
  body: formData,
});

ileInput.addEventListener("change", function () {
  if (fileInput.files.length > 0) {
    image = fileInput.files[0];
    let imageSize = image.size / 1024 / 1024;
    if (imageSize > 4) {
      alert("Veuillez choisir une photo de moins de 4Mo s'il vous plaît.");
      return;
    }
    const imageUrl = URL.createObjectURL(image);

    let imgPreview = document.createElement("img");
    imgPreview.src = imageUrl;
    imgPreview.alt = "Aperçu de l'image sélectionnée";
    imgPreview.style.width = "auto";
    imgPreview.style.height = "76px";
    imgPreview.style.marginTop = "5%";

    while (previewContainer.firstChild) {
      previewContainer.removeChild(previewContainer.firstChild);
    }
    previewContainer.appendChild(imgPreview);
  }
});
