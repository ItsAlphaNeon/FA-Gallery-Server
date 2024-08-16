document.addEventListener("DOMContentLoaded", function () {
    const item = JSON.parse(document.getElementById('submission-data').textContent);
    const commentsData = JSON.parse(document.getElementById('comments-data').textContent);

    document.getElementById('artwork-image').src = `/content${getFullImagePath(item)}`;
    document.getElementById('artwork-image').alt = item.title;
    document.getElementById('submission-title').textContent = item.title;
    document.getElementById('user-info').textContent = `${item.username}, posted ${new Date(item.date_uploaded).toDateString()}`;
    document.getElementById('description').textContent = item.desc; // TODO: Sanitize this, and allow markdown

    if (item.tags) {
        const tagsContainer = document.getElementById('tags-list');
        const tags = item.tags.split(',');
        tags.forEach(tag => {
            let span = document.createElement('span');
            span.textContent = tag.trim();
            tagsContainer.appendChild(span);
        });
    }

    const commentsContainer = document.getElementById('comments-section');
    if (commentsData && commentsData.length > 0) {
        commentsData.forEach(comment => {
            let commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `
                <div class="user">
                    <img src="${getCleanUserImg(comment.username)}" alt="Profile image for ${comment.username}" class="user-avatar">
                    <span>${comment.username}</span>
                </div>
                <p>${comment.desc}</p>
            `;
            commentsContainer.appendChild(commentDiv);
        });
    } else {
        commentsContainer.innerHTML = '<p>No comments yet.</p>';
    }
});

function getCleanUserImg(username) {
    const cleanName = username.split(' ')[0].toLowerCase().replace(/[_]/g, '');
    let imageUrl = encodeURIComponent(`https://a.furaffinity.net/${cleanName}.gif`);
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