async function handleSubmit(e) {
  e.preventDefault();
  const formData = new FormData(document.querySelector("#login"));

  try {
    // post the form data to api
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // switch case between response code error
    if (!response.ok) {
      if (response.status === 401) {
        alert("mot de passe incorecte");
        document.getElementsByClassName("error").classlist = "error";
        document.getElementsByClassName("error").innerText = "qsfqsfqsf";
        return;
      } else if (response.status === 404) {
        alert("utilisateur inconu");
        return;
      } else {
        alert("erreur server");
        throw new Error(`Response status: ${response.status}`);
        return;
      }
    }

    // saving session and redirecting to home
    const result = await response.json();
    window.localStorage.setItem("session", result.token);
    window.location.replace("http://127.0.0.1:5501/FrontEnd/index.html");

    return;
  } catch (error) {
    console.error(error.message);
    return;
  }
}

// here we load all function and do stuff on page load
function pageLoad() {
  const form = document.querySelector("#login");

  // if user is already logged in we redirect him to home page
  if (window.localStorage.getItem("session")) {
    window.location.href = "http://127.0.0.1:5501/FrontEnd/index.html";
  }

  form.addEventListener("submit", handleSubmit);
}

pageLoad();
