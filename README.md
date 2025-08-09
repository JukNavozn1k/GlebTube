
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Israeli_blue_Star_of_David.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">GlebTube</h3>

  <p align="center">
    A non-commercial YouTube clone
    <br/>
    <a href="https://github.com/JukNavozn1k/GlebTube/releases"><strong>Get release!</strong></a>
    <br />
    <br />
    <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">View Demo</a>
    ·
    <a href="https://github.com/JukNavozn1k/GlebTube/issues">Report Bug</a>
    ·
  </p>
</div>



## About project

### Description
This project is created for educational purposes and possibly in the case of blocking YouTube as a domestic analog. 
The project is written in Django with the use of custom plugins to add various functionality. 

### Roadmap

- [x] Add enchanced video player
- [x] Add user profile
- [ ] Add basic video editor on edit form
- [x] Add CRUD operations for comments
- [x] Redesign some elements of the site, adapt for mobile devices
- [x] Add HLS


<!-- GETTING STARTED -->
## Getting Started


This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these steps.




### Installation

_To execute the following commands, you need to install python and pip_

1. Clone the repo
   ```sh
   git clone https://github.com/JukNavozn1k/GlebTube
   ```
2. Setup .env
   ```
   DB_NAME=gg
   DB_USER=gleb
   DB_PASS=1234
   DB_HOST=db
   DB_PORT=5432
   ```
2. Install poetry via pip
   ```pip
   pip install poetry
   ```
3. Install poetry packages
   ```python
   poetry install
   ```
4. Run server via manage.py
   ```python
   poetry run python manage.py runserver
   ```
