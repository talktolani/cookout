set -e
mkdir -p /home/user/ed/fonts /home/user/ed/src && cd /home/user/ed
[ -d node_modules/@fontsource/league-gothic ] || { npm init -y >/dev/null 2>&1; npm i -s @fontsource/league-gothic @fontsource/oswald qrcode >/dev/null 2>&1; }
cp node_modules/@fontsource/league-gothic/files/league-gothic-latin-400-normal.woff2 fonts/lg.woff2
cp node_modules/@fontsource/oswald/files/oswald-latin-500-normal.woff2 fonts/os5.woff2
python3 -c "import cv2" 2>/dev/null || pip install -q opencv-python-headless 2>/dev/null
python3 -c "import rapidocr_onnxruntime" 2>/dev/null || pip install -q rapidocr_onnxruntime 2>/dev/null
node -e "require('qrcode').toString('https://thecookoutevent.com/preregister?utm_source=meta&utm_medium=video_qr&utm_campaign=tofu',{type:'svg',margin:0,errorCorrectionLevel:'M',color:{dark:'#0A0A0A',light:'#FFFFFF'}},(e,s)=>require('fs').writeFileSync('qr.svg',s))"
B=https://d8j0ntlcm91z4.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/hf_20260928_
C=https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay
cd src
get(){ [ -s "$1" ] || curl -s -o "$1" "$2"; }
get s7.png ${B}143105_b6bd7b5c-2600-4c22-885a-58ffde9fa2bf.png
get hotdog.png ${B}143020_9db7b323-fb9d-484c-b165-f32269a77d1b.png
get spread.png ${B}143839_f8bf7753-d349-4216-998d-efbde61fb3eb.png
get ext.jpg $C/dc08b807-ddc4-477d-9676-986546f2137d.jpg
get lounge.jpg $C/004a163f-bd15-4f37-b2c0-6db1c1079d6f.jpg
for p in 1:145845_8ce60466-bc39-465a-87ad-1cac9e9e303c 2:145845_254740ae-1ff4-403b-8d9e-ef1d88f59e85 3:145845_1b4655c2-324e-4efa-ad4e-e69afe83d01b 4:145844_60e60714-a97a-4094-9257-273646a74acf 5:145843_d14df241-284c-419e-8233-44113e3215fa 6:145845_26884a56-e97f-4a5a-b1b2-4072cd73ac20 8:145845_248d2d89-79ba-457b-9544-275d8eb885f4 9:145846_eda0c35a-b9a9-400b-8a1a-d9de0d5816a9 10:150111_0449cd4c-8b43-4df4-80d4-d170ebd62304 11:150122_416d3a1d-85b5-4ce4-b211-d77e2fa933d3 12:150112_f9e9bfcc-64cf-4324-83d7-70a33d6e67d8 13:150113_0a9bd00b-6845-4618-8e50-ed9dfcbece1f; do i=${p%%:*}; get c$i.mp4 "$B${p#*:}.mp4"; done
ls | wc -l
