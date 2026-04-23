@echo off
echo Starting MySQL...
net start mysql80

echo Starting Backend...
start cmd /k "cd /d C:\Users\thesa\Downloads\SafeNode\JOVAC PROJECT\_safenote-project\safenote-project && mvnw spring-boot:run"

echo Starting Frontend...
start cmd /k "cd /d C:\Users\thesa\Downloads\SafeNode\JOVAC PROJECT\safenote-frontend && npm start"

echo All services started!