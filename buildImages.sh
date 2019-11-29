#!/bin/bash

if [[ $(id -u) == 0 ]]; then
  echo "SUDO will bop the owner on all the asset files."
  exit
fi
rm ./Assets/icons/*.png
cp ./AssetMasters/*.png ./Assets/icons/
python3 ImageSplit.py
