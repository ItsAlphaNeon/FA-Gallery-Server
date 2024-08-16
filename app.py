from flask import Flask, render_template, request, jsonify, send_from_directory
import sqlite3
import os
import logging


app = Flask(__name__, static_folder="static")
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
DATABASE = "fa-gallery-downloader.db" # TODO: make this a dynamic search for the database
DOWNLOAD_DIR = os.path.join(os.getcwd(), "downloaded_content")

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db


@app.route("/content/<path:filename>")
def download_content(filename):
    return send_from_directory(DOWNLOAD_DIR, filename)


@app.route('/', methods=['GET'])
def search_user():
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join('static'),'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/gallery', methods=['GET'])
def gallery():
    user = request.args.get('user', '')
    search = request.args.get('search', '')
    gallery_type = request.args.get('gallery', 'main')
    sort = request.args.get('sort', 'DESC').upper()
    ratings = request.args.getlist('rating')  # Using getlist to handle multiple values
    page = int(request.args.get('page', 1))
    per_page = 50
    offset = (page - 1) * per_page

    search_conditions = f"WHERE id IS NOT NULL "
    if gallery_type.lower() == "favorites":
        search_conditions += f"AND url IN (SELECT url FROM favorites WHERE username LIKE '{user}') "
    elif gallery_type.lower() == "main":
        search_conditions += f"AND (username LIKE '%{user}%' OR account_name LIKE '{user}') "
    if search:
        search = f"%{search.replace(' ', '%')}%"
        search_conditions += f"AND (title LIKE '{search}' OR tags LIKE '{search}' OR desc LIKE '{search}' OR content_name LIKE '{search}') "
    if ratings:
        ratings_conditions = ", ".join(f"'{rating.title()}'" for rating in ratings)
        search_conditions += f"AND rating IN ({ratings_conditions}) "
    

    query = f"""
        SELECT id, title, username, account_name, content_url, thumbnail_url, date_uploaded, is_content_saved, content_name, is_thumbnail_saved, thumbnail_name, rating 
        FROM subdata
        {search_conditions}
        ORDER BY content_name {sort}
        LIMIT ? OFFSET ?
        """

    db = get_db()
    items = db.execute(query, (per_page, offset)).fetchall()
    logging.debug(f"Query: {query}")
    db.close()
    return jsonify([dict(item) for item in items])


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)