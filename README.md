# Furaffinity Gallery Viewer
## Please note: This is an experimental project, and is pretty scuffed.

The Furaffinity Gallery Viewer is a web server application designed to let you host and view a gallery of content downloaded from Furaffinity using the [FA-Gallery-Downloader](https://github.com/SpottedSqueak/FA-Gallery-Downloader). This application provides an easy-to-use, web-based interface for browsing your Furaffinity gallery offline, without the need to directly interact with Furaffinity's website or API.

## Features

- **Local Gallery Viewing**: View your downloaded Furaffinity content locally through a web interface.
- **Database Integration**: Uses the FA-Gallery-Downloader SQLite database to manage and display gallery metadata.
- **Content Categorization**: Organize and browse content based on tags, authors, sort by upload dates.
- **Responsive Web Design**: This application supports both basic viewing on desktop and mobile.

## Getting Started

### Prerequisites

Before you get started, ensure you have the following installed:
- Python Python 3.10 or higher
- Flask

You also need to have content downloaded using the [FA-Gallery-Downloader](https://github.com/SpottedSqueak/FA-Gallery-Downloader). This includes:
- A `.db` database file.
- A `downloaded_content` folder.

### Installation

1. **Clone the Repository**

```bash
git clone https://github.com/ItsAlphaNeon/FA-Gallery-Server.git
cd FA-Gallery-Server
```

2. **Install Dependencies**

```bash
pip install -r requirements.txt
```

3. **Prepare Your Content**

Ensure your `.db` database file and `downloaded_content` folder from the FA-Gallery-Downloader are in the root of the Furaffinity Gallery Viewer project directory.

4. **Run the Flask Server**

```bash
flask run
```

### Usage

After starting the Flask server, open your web browser and navigate to `http://127.0.0.1:80/` to start browsing your Furaffinity gallery.

## Disclaimer

Furaffinity Gallery Viewer is intended for personal use and designed to work with content you have legally downloaded. It does not interact with Furaffinity directly nor does it download any content from Furaffinity servers.

## License

This project is open-source and available under the MIT License. See the LICENSE file for more information.

## Acknowledgments

- Thanks to [SpottedSqueak](https://github.com/SpottedSqueak) for creating the FA-Gallery-Downloader, which this project relies upon for gallery content.
- All trademarks and copyrighted materials mentioned are the property of their respective owners.

## Contact

For support or to submit feedback, please create an issue on the GitHub project page.
