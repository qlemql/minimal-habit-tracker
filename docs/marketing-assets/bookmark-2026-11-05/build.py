from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
p=Path(__file__).parent
im=Image.new('RGB',(1080,1350),'#FFF5E5'); d=ImageDraw.Draw(im)
brown='#714B32'; coral='#FF8068'
def text(x,y,s,size,bold=False,fill=brown):
 f=ImageFont.truetype('C:/Windows/Fonts/'+('arialbd.ttf' if bold else 'arial.ttf'),size)
 d.text((x,y),s,font=f,fill=fill)
d.polygon([(825,0),(955,0),(955,310),(890,265),(825,310)],fill=coral)
text(90,95,'A NOTE FOR YOUR NEXT CHAPTER',23,True)
for i,line in enumerate(['Your bookmark','is still holding','your place.']): text(82,420+i*116,line,86,True)
d.line((90,865,240,865),fill=coral,width=7)
text(90,925,'No catch-up required.',45)
text(90,1200,'ssak.app',28,True)
im.save(p/'bookmark.png')
