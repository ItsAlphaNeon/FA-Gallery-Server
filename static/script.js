document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search");
    const userInput = document.getElementById("user");
    const sortInput = document.getElementById("sort");

    function fetchGallery() {
        const query = encodeURIComponent(searchInput.value);
        const user = encodeURIComponent(userInput.value);
        const sort = sortInput.value;
        const page = parseInt(document.getElementById("currentPage").value, 10);

        fetch(`/gallery?user=${user}&search=${query}&sort=${sort}&page=${page}`)
            .then((response) => response.json())
            .then((data) => updateGallery(data))
            .catch((error) => console.error("Error:", error));
    }

    function updateGallery(items) {
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "";
        items.forEach((item) => {
            const thumbUrl =
                item.is_thumbnail_saved == 1
                    ? getThumbnailPath(item)
                    : getFullImagePath(item);
            const itemDiv = document.createElement("div");
            itemDiv.className = "gallery-item";
            itemDiv.innerHTML = `
                <div class="gallery-item-thumbnail" title="View submission">
                    <img src="/content${thumbUrl}" alt="${item.title}" class="gallery-thumbnail">
                </div>
                <div class="gallery-item-info">
                    <div class="title" title="${item.title}">${item.title}</div>
                    <div class="author" title="Search for this user!">by ${item.username}</div>
                    <div class="date" title="Uploaded: ${item.date_uploaded}">Uploaded: ${item.date_uploaded}</div>
                </div>
            `;
            gallery.appendChild(itemDiv);
        });
    }

    function getFullImagePath(item) {
        const user = item.username;
        const content = item.content_name;
        return `/${user}/${content}`;
    }

    function getThumbnailPath(item) {
        const user = item.username;
        const thumbnail_name = item.thumbnail_name;
        return `/${user}/thumbnail/${thumbnail_name}`;
    }

    document
        .getElementById("prevPage")
        .addEventListener("click", () => navigatePages(-1));
    document
        .getElementById("nextPage")
        .addEventListener("click", () => navigatePages(1));
    searchInput.addEventListener("input", fetchGallery);
    userInput.addEventListener("input", fetchGallery);
    sortInput.addEventListener("change", fetchGallery);

    function navigatePages(change) {
        const currentPageInput = document.getElementById("currentPage");
        let currentPage = parseInt(currentPageInput.value, 10);
        currentPage += change;
        currentPageInput.value = currentPage;
        fetchGallery();
    }

    fetchGallery();
});
