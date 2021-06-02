# Itunes search app

This project consists of a front end (vue js) and a backend (node js) that connect to the itunes search API to get infromation from artists and albums.

Features:
 - Searches artists in real time when typing.
 - Displays an album view that includes the albums from the artist selected.
 - Live search box to filter the existing album results by text.
 - Pagination when displaying the results.
 - Search history: possibility to easily explore again the albums recently visited.
 
 Tests:
 
 - Unit tests that covers both the front end and the backend.
 - Some integration testing between the differnt components of the backend.

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

If the frontend is built, the backend will use the dist folder to directly serve the app (it is not neccessay to run the frontend, just to compile it).

The frontend is supposed to listen to port 8080 and the backend will be listening requests from 4000. However, you can still change the port to run it in a different way.

	set PORT:8080

Unit testing:

 1. Backend: npm test
 2. Frontend: npm run test:unit

You can also run the app from a Dockerfile (included in the project):

	docker build -t itunes-search-app .
	docker run -d -it -p  4000:4000--name vue-node-ui itunes-search-app


## [Task2: code snippet ](task2.md)
