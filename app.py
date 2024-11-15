from flask import Flask, render_template, request, jsonify, send_from_directory, send_file, Response
import sqlite3
import os
import logging
import requests
import io
from PIL import Image
import sys
import argparse

try:
    DATABASE = [file for file in os.listdir() if file.endswith('.db')][0]
except IndexError:
    DATABASE = None
if not DATABASE:
    sys.exit(f"Database not found. Please import your database file to {os.getcwd()}")
DOWNLOAD_DIR = os.path.join(os.getcwd(), "downloaded_content")
if not os.path.exists(DOWNLOAD_DIR):
    sys.exit(f"Download directory not found. Please import your downloaded_content folder to {os.getcwd()}")

parser = argparse.ArgumentParser(description='Run the Flask app with options to manage thumbnails.')
parser.add_argument('--clear-thumbnails', action='store_true', help='Clear all thumbnail caches')
args = parser.parse_args()

def clear_thumbnails(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith("_thumbnail.webp"):
                thumbnail_path = os.path.join(root, file)
                os.remove(thumbnail_path)
                print(f"Removed {thumbnail_path}")
                
if args.clear_thumbnails:
    clear_thumbnails(DOWNLOAD_DIR)
    print("All thumbnails cleared.")
    sys.exit()


app = Flask(__name__, static_folder="static")
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db


@app.route("/content/<username>/<path:filename>") 
def download_content(username, filename):
    base_dir = os.path.join(DOWNLOAD_DIR, username)
    image_path = os.path.join(base_dir, filename)
    thumbnail_requested = request.args.get('thumbnail', False)

    if thumbnail_requested:
        ensure_thumbnail(image_path)  # Only ensure it exists
        thumbnail_filename = f"{filename.split('.')[0]}_thumbnail.webp"  # Expected filename
        return send_from_directory(base_dir, thumbnail_filename)
    else:
        return send_from_directory(base_dir, filename)




@app.route('/', methods=['GET'])
def search_user():
    return render_template('gallery-browser.html')

@app.route('/submission/<int:submission_id>')
def submission_view(submission_id):
    db = get_db()
    try:
        submission_query = "SELECT * FROM subdata WHERE id = ?"
        submission = db.execute(submission_query, (submission_id,)).fetchone()
        if submission is None:
            return "Submission not found", 404
        
        submission_dict = dict(submission) if submission else None

        comments_query = "SELECT * FROM commentdata WHERE submission_id = ? ORDER BY date DESC"
        comments = db.execute(comments_query, (submission_id,)).fetchall()
        comments_list = [dict(comment) for comment in comments]
        
        return render_template('submission-view.html', item=submission_dict, comments=comments_list)
    
    finally:
        db.close()
        
@app.route('/submission/<int:submission_id>/neighbors')
def submission_neighbors(submission_id):
    db = get_db()
    try:
        submission_query = "SELECT username, date_uploaded FROM subdata WHERE id = ?"
        submission = db.execute(submission_query, (submission_id,)).fetchone()
        if submission is None:
            return "Submission not found", 404
        
        username, date_uploaded = submission['username'], submission['date_uploaded']
        
        previous_query = "SELECT id, title FROM subdata WHERE username = ? AND date_uploaded < ? ORDER BY date_uploaded DESC LIMIT 1"
        previous = db.execute(previous_query, (username, date_uploaded)).fetchone()
        
        next_query = "SELECT id, title FROM subdata WHERE username = ? AND date_uploaded > ? ORDER BY date_uploaded ASC LIMIT 1"
        next = db.execute(next_query, (username, date_uploaded)).fetchone()
        
        return jsonify({
            'previous': dict(previous) if previous else None,
            'next': dict(next) if next else None
        })
    
    finally:
        db.close()


@app.route('/proxy-image/')
def proxy_image():
    image_url = request.args.get('url')
    if image_url:
        response = requests.get(image_url)
        return Response(response.content, mimetype=response.headers['Content-Type'])
    return "No image URL provided", 400


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join('static'),'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/gallery', methods=['GET'])
def gallery():
    user = request.args.get('user', '')
    search = request.args.get('search', '')
    gallery_type = request.args.get('gallery', 'main')
    sort = request.args.get('sort', 'DESC').upper()
    ratings = request.args.getlist('rating')  
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
        SELECT id, title, username, account_name, content_url, thumbnail_url, date_uploaded, is_content_saved, content_name, is_thumbnail_saved, thumbnail_name, rating , category, tags, desc
        FROM subdata
        {search_conditions}
        ORDER BY content_name {sort}
        LIMIT ? OFFSET ?
        """

    db = get_db()
    items = db.execute(query, (per_page, offset)).fetchall()
    db.close()
    return jsonify([dict(item) for item in items])


def ensure_thumbnail(image_path):
    directory, filename = os.path.split(image_path)
    thumbnail_path = os.path.join(directory, f"{filename.split('.')[0]}_thumbnail.webp")

    if not os.path.exists(thumbnail_path):
        create_thumbnail(image_path, thumbnail_path)
    return thumbnail_path


def create_thumbnail(image_path, thumbnail_path):
    with Image.open(image_path) as img:
        width, height = img.size
        if width < 500 or height < 500:
            img.thumbnail((width, height)) # No need to resize
            img.save(thumbnail_path, "WEBP")
            return
        new_width = int(width * 0.3)
        new_height = int(height * 0.3)
        img.thumbnail((new_width, new_height))
        img.save(thumbnail_path, "WEBP")



if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)