
if [ -z "$1" ];
then
    script="server";
else
    script="$1"
fi


echo "alias $script=\"node $(pwd)/server.js\"" >> ~/.bashrc


