from flask import Flask, render_template, request, jsonify, send_from_directory
import sqlite3
import os
import logging


app = Flask(__name__, static_folder="static")
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
DATABASE = "gallery.db"
DOWNLOAD_DIR = os.path.join(os.getcwd(), "downloaded_content")

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db


@app.route("/content/<path:filename>")
def download_content(filename):
    return send_from_directory(DOWNLOAD_DIR, filename)


@app.route("/")
def index():
    return render_template("index.html")

@app.route('/gallery', methods=['GET'])
def gallery():
    user = request.args.get('user', '')
    search = request.args.get('search', '')
    gallery_type = request.args.get('gallery', 'main')
    sort = request.args.get('sort', 'DESC').upper()
    page = int(request.args.get('page', 1))
    per_page = 50
    offset = (page - 1) * per_page

    search_conditions = f"WHERE id IS NOT NULL "
    if user:
        search_conditions += f"AND (username LIKE '%{user}%' OR account_name LIKE '%{user}%') "
    if search:
        search = f"%{search.replace(' ', '%')}%"
        search_conditions += f"AND (title LIKE '{search}' OR tags LIKE '{search}' OR desc LIKE '{search}' OR content_name LIKE '{search}') "

    if gallery_type.lower() == "favorites":
        search_conditions += f"AND url IN (SELECT url FROM favorites WHERE username LIKE '%{user}') "

    query = f"""
        SELECT id, title, username, account_name, content_url, thumbnail_url, date_uploaded, is_content_saved, content_name, is_thumbnail_saved, thumbnail_name 
        FROM subdata
        {search_conditions}
        ORDER BY content_name {sort}
        LIMIT ? OFFSET ?
    """

    db = get_db()
    items = db.execute(query, (per_page, offset)).fetchall()
    db.close()
    logging.debug(f"Query: {query}")
    logging.debug(f"Items: {jsonify([dict(item) for item in items])}")
    return jsonify([dict(item) for item in items])

if __name__ == "__main__":
    app.run(debug=True)
