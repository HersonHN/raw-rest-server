# Raw Rest Server

This script provides a restfull server for testing purpose

## Installation

1. Clone the repo

        git clone https://github.com/HersonHN/raw-rest-server.git
        cd raw-rest-server

2. Install dependencies

    `npm install` or `sudo npm install` 

3. Set an alias to run the server

        sh install.sh  #this create a server alias
    
    or

        sh install.sh customname  #set a custom for the alias

    (Reload your terminal after set the alias)

## Usage

    cd ~/my/custom/path
    server

or 
    
    server 3000 # custom port

The script will try to load the default data from the path you are invoking it,
if it not exists will try to load it from the script's path.


## Save changes

    http://localhost:1991/api/save!!!

