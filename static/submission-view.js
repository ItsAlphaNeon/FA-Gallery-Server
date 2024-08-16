document.addEventListener("DOMContentLoaded", function () {
    const item = JSON.parse(document.getElementById("submission-data").textContent);
    const contentContainer = document.getElementById("content-container");

    const fileType = item.content_name.split('.').pop().toLowerCase();
    switch(fileType) {
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

    document.getElementById("submission-title").textContent = item.title;
    document.getElementById("user-info").textContent = `${item.username
        }, posted ${new Date(item.date_uploaded).toDateString()}`;
    document.getElementById("description").innerHTML = sanitizeHTML(item.desc) // TODO: Sanitize this, and allow markdown
    

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
    // Use DOMPurify to clean the HTML
    const cleanHTML = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], // Allow only the tags you need
        ADD_ATTR: ['width', 'height', 'style'], // Add any attributes you need, but be cautious with style to prevent CSS-based attacks
        FORBID_TAGS: ['img'] // Disallow <img> tags
    });

    // Optionally, you could manipulate the HTML further, e.g., adjust <img> tags
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(cleanHTML, 'text/html');

    // Ensure links work
    const links = parsedHtml.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
        links[i].setAttribute('target', '_blank');
    }

    // Serialize the HTML back to a string
    const div = document.createElement('div');
    div.appendChild(parsedHtml.body.firstChild);
    return div.innerHTML;
}