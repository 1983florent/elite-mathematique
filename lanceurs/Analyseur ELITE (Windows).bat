@echo off
setlocal
rem Ouvre l'analyseur dans sa propre fenetre, via le navigateur deja installe.
set "HTML=%~dp0analyseur-plagiat.html"
set "URL=file:///%HTML:\=/%"

set "EDGE1=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE2=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "CHR1=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHR2=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if exist "%EDGE1%" ( start "" "%EDGE1%" --app="%URL%" & goto :fin )
if exist "%EDGE2%" ( start "" "%EDGE2%" --app="%URL%" & goto :fin )
if exist "%CHR1%"  ( start "" "%CHR1%"  --app="%URL%" & goto :fin )
if exist "%CHR2%"  ( start "" "%CHR2%"  --app="%URL%" & goto :fin )
rem Aucun navigateur Chromium trouve : ouverture dans le navigateur par defaut.
start "" "%HTML%"
:fin
