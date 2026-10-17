## Download tools and setup env

#download git
winget install --id Git.Git -e --source winget --silent --accept-package-agreements --accept-source-agreements

# download vs code
winget install --id Microsoft.VisualStudioCode --silent --accept-package-agreements --accept-source-agreements

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
git --version

git config --global user.name "Tim"
git config --global user.email "luismuraya11@gmail.com"

cd "C:\Users\000937691\Documents"

git clone https://github.com/TimothyMwangi101/Little-League-Hamilton.git 

cd "C:\Users\000937691\Documents\Little-League-Hamilton"

## downloading node locally
Invoke-WebRequest -Uri "https://nodejs.org/dist/v24.22.0/node-v24.22.0-win-x64.zip" -OutFile "node.zip"
Expand-Archive -Path "node.zip" -DestinationPath "."
Rename-Item -Path "node-v24.22.0-win-x64" -NewName "node-local"
Remove-Item -Path "node.zip" -Force

powershell.exe
powershell.exe 


$env:PATH = "C:\Users\000937691\Documents\Little-League-Hamilton\node-local;$env:PATH"
node -v
npm -v

# for better auth dependancy
## $env:PYTHON="C:\ProgramData\anaconda3\python.exe"


$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
code .
