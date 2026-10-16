## Used to download and install a local version of Node.js for the project for school comp.

Invoke-WebRequest -Uri "https://nodejs.org/dist/v26.12.0/node-v26.12.0-win-x64.zip" -OutFile "node.zip"
Expand-Archive -Path "node.zip" -DestinationPath "."
Rename-Item -Path "node-v26.12.0-win-x64" -NewName "node-local"

cd LLH_UI
$env:PATH = "C:\Users\000937691\Documents\Little-League-Hamilton\node-local;$env:PATH"

cd ..\LLH_Server
$env:PATH = "C:\Users\000937691\Documents\Little-League-Hamilton\node-local;$env:PATH"

node -v