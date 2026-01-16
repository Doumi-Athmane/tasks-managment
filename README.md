
Technical choices : 

- For the backend server python-drf
- For the database : PostgreSQL
- For the authentication JWT
- For the frontend vite-react



How to luanch the project : 

1. Backend :
 - create a file .env in the backend folder (backend/.env)
 - it should contain those variables :
    DJANGO_SECRET_KEY=dev-secret-key-change-me
    DJANGO_DEBUG=1
    POSTGRES_DB=appdb
    POSTGRES_USER=app
    POSTGRES_PASSWORD=app
    POSTGRES_HOST=db
    POSTGRES_PORT=5432
 - to start the server you should run those two commandes line : 
     - docker compose build
     - docker compose up
     - docker compose exec backend python manage.py migrate
 The backend server should be working right now on port 8000  (localhost:8000)



 2. Frontend :
  - run npm install commande line
  - create a file .env in the frontend folder (fronted/.env)
  - the file should contain : 
        VITE_API_BASE_URL = http://localhost:8000/api
  - run npm run dev
  The frontend should be working on the port 3000 (localhost:3000)



