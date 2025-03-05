Backend for the task management system in express/postgresql, using jwt tokens for authentication.

Using the api:
1. clone the repo
2. run "npm i" or "npm install"
3. create the .env file and fill the next properties:
PORT= "default port for the server to run"
DB_HOST= "your postgres db address"
DB_USER= "your postgres user"
DB_PASSWORD= "your postgres password"
DB_NAME = "your postgres db name"
DB_PORT=5432 = "your postgres server port"
SECRET_KEY= "secret key for the jwt"
4. run "npm run start"

if you get "
Server running on port ***
Connected to postgresql database
"

then it means that it is running 