# Itunes search app

This project consists of a front end (vue js) and a backend (node js) that connect to the itunes search API to get information from artists and albums.

Features:
 - Searches artists in real time when typing.
 - Displays an album view that includes the albums from the artist selected.
 - Live search box to filter the existing album results by text.
 - Pagination when displaying the results.
 - Search history: possibility to easily explore again the albums recently visited.
 
 Tests:
 
 - Unit tests that cover both the front end and the backend.
 - Some integration testing between the different components of the backend.

## Run the app

 1. Clone from repo. https://github.com/paufr/itunes_search_app.git
 2. Then apply the following step to execute it.
	
		//frontend
		cd frontend
		npm install
		npm build
		npm run serve //it can be run separately from the backend

		//let's start with the backend
		cd backend
		npm install
		npm start

If the frontend is built, the backend will use the dist folder to directly serve the app (it is not necessary to run the frontend, just to compile it).

The backend will be listening requests on port 4000. However, you can still change the port to run it differently.
	set PORT:8080

On the other hand, if you want to directly run the frontend, it will try listen on port 8080.

Unit testing:

 1. Backend: npm test
 2. Frontend: npm run test:unit

You can also run the app from a Dockerfile (included in the project):

	docker build -t itunes-search-app .
	docker run -p 4000:4000 itunes-search-app


## [Task2: code snippet ](task2.md)
