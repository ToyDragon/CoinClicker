./buildImages.sh
cd Game && tsc && webpack && sass Game.scss ../bin/game/Game.css; cd ..;
cd Server && tsc; cd ..;
