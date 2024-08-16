document.addEventListener("DOMContentLoaded", function () {
    const item = JSON.parse(document.getElementById("submission-data").textContent);
    const contentContainer = document.getElementById("content-container");

    const fileType = item.content_name.split('.').pop().toLowerCase();
    switch (fileType) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            renderImage(contentContainer, item);
            break;
        case 'mp3':
            renderAudio(contentContainer, item);
            break;
        case 'swf':
            renderFlash(contentContainer, item);
            break;
        case 'pdf':
            renderPDFLink(contentContainer, item);
            break;
        default:
            contentContainer.textContent = 'Unsupported file type.';
    }
    const commentsData = JSON.parse(
        document.getElementById("comments-data").textContent
    );

    fetch(`/submission/${item.id}/neighbors`)
        .then(response => response.json())
        .then(neighborsData => {
            setupNavigationButtons(neighborsData);
        })
        .catch(error => {
            console.error('Error fetching neighbors data:', error);
        });

    document.getElementById("submission-title").textContent = item.title;
    document.getElementById("user-info").textContent = `${item.username
        }, posted ${new Date(item.date_uploaded).toDateString()}`;
    document.getElementById("description").innerHTML = sanitizeHTML(item.desc)


    // Rating header
    const ratingHeader = document.createElement("h3");
    ratingHeader.textContent = `Rating: ${item.rating}`;
    ratingHeader.className = getRatingClass(item.rating);
    document.querySelector(".right-panel .rating").appendChild(ratingHeader);

    // Category header
    const categoryHeader = document.createElement("h3");
    categoryHeader.textContent = item.category;
    categoryHeader.className = "category";
    document.querySelector(".right-panel .rating").appendChild(categoryHeader);

    if (item.tags) {
        const tagsContainer = document.getElementById("tags-list");
        const tags = item.tags.split(",");
        const details = document.createElement("details");
        tags.forEach((tag) => {
            let span = document.createElement("span");
            span.textContent = tag.trim();
            tagsContainer.appendChild(span);
        });
    }

    const commentsContainer = document.getElementById("comments-section");
    if (commentsData && commentsData.length > 0) {
        commentsData.forEach((comment) => {
            let commentDiv = document.createElement("div");
            commentDiv.className = "comment";
            commentDiv.innerHTML = `
                <div class="user">
                    <img src="${getCleanUserImg(
                comment.username
            )}" alt="Profile image for ${comment.username
                }" class="user-avatar">
                    <span>${comment.username}</span>
                </div>
                <p>${comment.desc}</p>
            `;
            commentsContainer.appendChild(commentDiv);
        });
    } else {
        commentsContainer.innerHTML = "<p>No comments yet.</p>";
    }
});

function setupNavigationButtons(neighborsData) {
    const prevBtn = document.getElementById("prev-button");
    const nextBtn = document.getElementById("next-button");

    if (neighborsData.previous) {
        prevBtn.addEventListener("click", function() {
            window.location.href = `/submission/${neighborsData.previous.id}`;
        });
    } else {
        prevBtn.disabled = true; 
    }

    if (neighborsData.next) {
        nextBtn.addEventListener("click", function() {
            window.location.href = `/submission/${neighborsData.next.id}`;
        });
    } else {
        nextBtn.disabled = true; 
    }
}

function getCleanUserImg(username) {
    const cleanName = username.split(" ")[0].toLowerCase().replace(/[_]/g, "");
    let imageUrl = encodeURIComponent(
        `https://a.furaffinity.net/${cleanName}.gif`
    );
    return `/proxy-image/?url=${imageUrl}`;
}

function getFullImagePath(item) {
    const user = cleanAccountName(item.account_name);
    const content = item.content_name;
    return `/${user}/${content}`;
}

function cleanAccountName(account_name) {
    return account_name.replace(/\.$/, "._");
}

function getRatingClass(rating) {
    switch (rating) {
        case "General":
            return "rating-general-submission";
        case "Mature":
            return "rating-mature-submission";
        case "Adult":
            return "rating-adult-submission";
        default:
            return "";
    }
}

function renderImage(container, item) {
    const imagePath = `/content${getFullImagePath(item)}`;
    const imageElement = document.createElement("img");
    imageElement.src = imagePath;
    imageElement.alt = item.title;

    const link = document.createElement("a");
    link.href = imagePath;
    link.target = "_blank";
    link.title = item.title;
    link.appendChild(imageElement);

    container.appendChild(link);
}

function renderAudio(container, item) {
    const audioPath = `/content${getFullImagePath(item)}`;
    const audioElement = document.createElement("audio");
    audioElement.src = audioPath;
    audioElement.controls = true;
    container.appendChild(audioElement);
}

function renderFlash(container, item) {
    const flashPath = `/content${getFullImagePath(item)}`;
    const ruffleElement = document.createElement("ruffle-player");
    ruffleElement.src = flashPath;
    container.appendChild(ruffleElement);
}

function renderPDFLink(container, item) {
    const pdfPath = `/content${getFullImagePath(item)}`;
    const link = document.createElement("a");
    link.href = pdfPath;
    link.textContent = "Download PDF";
    link.target = "_blank";
    container.appendChild(link);
}

function sanitizeHTML(html) {
    const allowedTags = [
        'a', 'b', 'blockquote', 'br', 'code', 'del', 'em', 'h1', 'h2', 'h3', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 's', 'strike', 'strong', 'sub', 'sup', 'u', 'ul'
    ];
    const allowedAttributes = {
        'a': ['href', 'title', 'target'],
        'img': ['alt']
    };
    
    const placeholderImageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQAAAAAm/md7AAAAEklEQVR42mP8z8Dwn4EIwDiqkL4KAJZ0GDSp+zuwAAAAAElFTkSuQmCC";

    let cleanHTML = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttributes,
    });

    const div = document.createElement('div');
    div.innerHTML = cleanHTML;

    const userLinks = div.getElementsByTagName('a');
    for (let i = 0; i < userLinks.length; i++) {
        const link = userLinks[i];
        const username = link.textContent.trim();
        link.href = `https://www.furaffinity.net/user/${username}`;
    }

    const images = div.getElementsByTagName('img');
    for (let img of images) {
        img.src = placeholderImageSrc;
        img.style.width = "32px";
        img.style.height = "32px";
    }

    return div.innerHTML;
}
