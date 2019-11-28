import os
from PIL import Image
from PIL import ImageEnhance

baseDir = "./Assets/icons/"

for filename in os.listdir(baseDir):
    index = filename.find("512.png")
    if index != -1:
        baseName = filename[0:index]
        baseImage = Image.open(baseDir + "/" + baseName + "512.png")
        lightenLambda = lambda i: ((i*i)/(256*256))*64 + 192
        lightImage = baseImage.copy().split()   
        lightImage[0].paste(lightImage[0].point(lightenLambda))
        lightImage[1].paste(lightImage[1].point(lightenLambda))
        lightImage[2].paste(lightImage[2].point(lightenLambda))
        lightImage = Image.merge(baseImage.mode, lightImage)
        colorEnhancer = ImageEnhance.Color(lightImage)
        lightImage = colorEnhancer.enhance(1.5)
        lightImage.save(baseDir + "/" + baseName + "512light.png")
        
        sizes = [16, 32, 64, 128]
        for sizeI in range(len(sizes)):
            size = sizes[sizeI]
            sizedImage = baseImage.resize((size, size), Image.LANCZOS)
            sizedImage.save(baseDir + "/" + baseName + str(size) + ".png")
            
            lightImage = sizedImage.copy().split()
            lightImage[0].paste(lightImage[0].point(lightenLambda))
            lightImage[1].paste(lightImage[1].point(lightenLambda))
            lightImage[2].paste(lightImage[2].point(lightenLambda))
            lightImage = Image.merge(sizedImage.mode, lightImage)

            colorEnhancer = ImageEnhance.Color(lightImage)
            lightImage = colorEnhancer.enhance(0.25)
            lightImage.save(baseDir + "/" + baseName + str(size) + "light.png")