import json, numpy as np
from PIL import Image, ImageFilter
SP='/tmp/claude-0/-home-user/4b9035fb-65a5-5a96-b6e2-5af82fc1e2b0/scratchpad/'
quad=json.load(open(SP+'crook/phone-quad.json'))
base=Image.open('/home/user/velani-shopify-website/docs/reference/night-ai-phone-blank.webp').convert('RGB')
TL,TR,BR,BL=[np.array(p,float) for p in quad]
w=(np.linalg.norm(TR-TL)+np.linalg.norm(BR-BL))/2; h=(np.linalg.norm(BL-TL)+np.linalg.norm(BR-TR))/2
SW=390; SH=int(round(SW*h/w))
page=Image.open(SP+'clients/yavi-rewards.png').convert('RGB')
bar=page.crop((0,790,390,845)); content=page.crop((0,0,390,768)); bg=page.getpixel((5,760))
scr=Image.new('RGB',(SW,SH),bg); scr.paste(content,(0,46)); scr.paste(bar,(0,SH-55))
S=2; W,H=base.size; big=(W*S,H*S)
def coeffs(pa,pb):
    A=[]
    for (x,y),(u,v) in zip(pa,pb): A.append([x,y,1,0,0,0,-u*x,-u*y]); A.append([0,0,0,x,y,1,-v*x,-v*y])
    return np.linalg.solve(np.array(A,float),np.array([c for p in pb for c in p],float))
c=coeffs([tuple(p*S) for p in (TL,TR,BR,BL)],[(0,0),(SW,0),(SW,SH),(0,SH)])
warped=scr.transform(big,Image.PERSPECTIVE,c,Image.BICUBIC)
mask=Image.open(SP+'crook/phone-mask.png').convert('L').filter(ImageFilter.MaxFilter(3)).resize(big,Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.0))
out=Image.composite(warped,base.resize(big,Image.LANCZOS),mask).resize((W,H),Image.LANCZOS)
out.save(SP+'crook/phone-fixed.png'); print('screen',SW,SH)
