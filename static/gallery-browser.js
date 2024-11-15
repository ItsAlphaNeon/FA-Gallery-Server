document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search");
    const userInput = document.getElementById("user");
    const sortInput = document.getElementById("sort");

    function search() {
        resetPageNumber();
        fetchGallery();
        console.log("Searching...)");
    }

    function fetchGallery() {
        const query = encodeURIComponent(searchInput.value);
        const user = encodeURIComponent(userInput.value);
        const sort = sortInput.value;
        const page = parseInt(document.getElementById("currentPage").value, 10);
        const ratings = Array.from(
            document.querySelectorAll('input[name="rating"]:checked')
        ).map((el) => el.value);
        const gallery = document.getElementById("gallery");

        let url = `/gallery?user=${user}&search=${query}&sort=${sort}&page=${page}&gallery=${gallery.value}`;
        ratings.forEach((rating) => {
            url += `&rating=${encodeURIComponent(rating)}`;
        });

        fetch(url)
            .then((response) => response.json())
            .then((data) => updateGallery(data))
            .catch((error) => console.error("Error:", error));
    }

    function updateGallery(items) {
        updatePageNumber();
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "";
        items.forEach((item) => {
            const thumbUrl =
                item.is_thumbnail_saved == 1
                    ? getThumbnailPath(item)
                    : getFullImagePath(item);
            let url = `/content/${encodeURIComponent(
                item.account_name
            )}/${encodeURIComponent(thumbUrl)}?thumbnail=true`;

            const itemDiv = document.createElement("div");
            itemDiv.className = "gallery-item";

            const ratingClass = getRatingClass(item.rating);
            itemDiv.className += ` ${ratingClass}`;

            const ratingPanel = `
                <div class="gallery-item-rating ${ratingClass}" title="Rating: ${item.rating}">
                    ${item.rating}
                </div>
            `;

            const infoPanel = `
                <div class="gallery-item-info">
                    <div class="title" title="${item.title}">${item.title}</div>
                    <div class="author" title="Search for this user">
                        <span class="author-label">by</span>
                        <span class="author-name">${item.username}</span>
                        <a href="/?user=${item.account_name}" class="search-link">🔍</a>
                    </div>
                    <div class="date" title="${item.date_uploaded}">Uploaded: ${item.date_uploaded}</div>
                </div>
            `;

            itemDiv.innerHTML = ratingPanel + infoPanel;

            const itemButton = document.createElement("button");
            itemButton.style.background = "none";
            itemButton.style.border = "none";
            itemButton.style.padding = "0";
            itemButton.style.margin = "0";
            itemButton.style.width = "auto";
            itemButton.style.height = "auto";
            itemButton.style.cursor = "pointer";
            itemButton.innerHTML = `
                <img src="${url}" alt="${item.title}" class="gallery-thumbnail" onerror="this.onerror=null;this.src='/static/images/default-thumbnail.svg';">
            `;

            itemButton.onclick = function () {
                window.location.href = `/submission/${item.id}`;
            };

            itemDiv.appendChild(itemButton);
            gallery.appendChild(itemDiv);
        });
    }

    function getRatingClass(rating) {
        switch (rating) {
            case "General":
                return "rating-general";
            case "Mature":
                return "rating-mature";
            case "Adult":
                return "rating-adult";
            default:
                return "";
        }
    }

    function getFullImagePath(item) {
        const user = cleanAccountName(item.account_name);
        const content = item.content_name;
        return `/${content}`;
    }

    function getThumbnailPath(item) {
        const user = cleanAccountName(item.account_name);
        const thumbnail_name = item.thumbnail_name;
        return `/thumbnail/${thumbnail_name}`;
    }

    function cleanAccountName(account_name) {
        return account_name.replace(/\.$/, "._");
    }

    function updatePageNumber() {
        const currentPage = document.getElementById("currentPage");
        const currentPageText = document.getElementById("currentPageText");
        const currentPageTextBottom = document.getElementById(
            "currentPageTextBottom"
        );
        const CurrentPageTextMobile = document.getElementById(
            "currentPageTextMobile"
        );
        currentPageText.innerText = `Current Page: ${currentPage.value}`;
        currentPageTextBottom.innerText = `Current Page: ${currentPage.value}`;
        CurrentPageTextMobile.innerText = `Current Page: ${currentPage.value}`;
    }

    function resetPageNumber() {
        const currentPage = document.getElementById("currentPage");
        currentPage.value = 1;
    }

    document.getElementById("searchButton").addEventListener("click", search);

    document.getElementById("user").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            search();
        }
    });

    document
        .getElementById("search")
        .addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                search();
            }
        });

    document.getElementById("sort").addEventListener("change", function (event) {
        fetchGallery();
    });

    document
        .getElementById("prevPageDesktop")
        .addEventListener("click", () => navigatePages(-1));
    document
        .getElementById("nextPageDesktop")
        .addEventListener("click", () => navigatePages(1));

    document
        .getElementById("prevPageDesktopBottom")
        .addEventListener("click", () => navigatePages(-1));
    document
        .getElementById("nextPageDesktopBottom")
        .addEventListener("click", () => navigatePages(1));
    document
        .getElementById("prevPageMobile")
        .addEventListener("click", () => navigatePages(-1));
    document
        .getElementById("nextPageMobile")
        .addEventListener("click", () => navigatePages(1));

    document.querySelectorAll('input[name="rating"]').forEach((checkbox) => {
        checkbox.addEventListener("change", fetchGallery);
    });

    document.getElementById("gallery").addEventListener("change", fetchGallery);

    function navigatePages(change) {
        const currentPageInput = document.getElementById("currentPage");
        let currentPage = parseInt(currentPageInput.value, 10);
        currentPage += change;
        if (currentPage < 1) {
            currentPage = 1;
        }
        currentPageInput.value = currentPage;
        fetchGallery();
    }

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("search-link")) {
            event.preventDefault();
            const urlParams = new URLSearchParams(event.target.href.split("?")[1]);
            const user = urlParams.get("user");
            userInput.value = user;
            fetchGallery();
        }
    });

    fetchGallery();
});
