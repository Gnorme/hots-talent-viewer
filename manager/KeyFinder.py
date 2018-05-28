import png, array
import re
from pymongo import MongoClient
import itertools
import os

client = MongoClient()
db = client['talentsDB']


#level = 13

#client = MongoClient()
#db = client['talentsDB']
#db.talents.update({'hero': hero,'level': level}, {'$unset':{'keys':1}})
#print db.talents.find_one({'hero': hero,'level': level,'talents.name':'Block Party'})
#keyholes = [[0,0], [0, 2]]
keySize = 2

def PixelMatch(img1, img2, width, height, threshold):
	if len(img1) != len(img2):
		print ("Image sizes don't match")
		return

	maxDelta = 35215 * threshold * threshold
	diff = 0

	for y in range(0,height):
		for x in range(0,width):
			pos = (y * width + x) * 4
			delta = ColorDelta(img1, img2, pos, pos)
			if delta > maxDelta:
				diff += 1

	return diff

def ColorDelta(img1, img2, k, m):
	a1 = img1[k + 3] / 255
	a2 = img2[m + 3] / 255

	r1 = blend(img1[k + 0], a1)
	g1 = blend(img1[k + 1], a1)
	b1 = blend(img1[k + 2], a1)

	r2 = blend(img2[m + 0], a2)
	g2 = blend(img2[m + 1], a2)
	b2 = blend(img2[m + 2], a2)

	y = rgb2y(r1, g1, b1) - rgb2y(r2, g2, b2)

	i = rgb2i(r1, g1, b1) - rgb2i(r2, g2, b2)
	q = rgb2q(r1, g1, b1) - rgb2q(r2, g2, b2)

	return 0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q

def rgb2y(r,g,b):
	return r * 0.29889531 + g * 0.58662247 + b * 0.11448223
def rgb2i(r,g,b):
	return r * 0.59597799 - g * 0.27417610 - b * 0.32180189
def rgb2q(r,g,b):
	return r * 0.21147017 - g * 0.52261711 + b * 0.31114694
def blend(c,a):
	return 255 + (c - 255) * a

def DiscoverKeyholes(hero, lvl, size, amount):
	data = []
	keyhole = [0,0]*(amount-1)
	highest = 0
	talents = GetTalents(hero, lvl)
	for talent in talents:
		w, h, all_pixels, metadata = GetImgData('talents/'+hero+'/'+str(lvl)+'/'+talent)
		all_pixels = list(itertools.chain(*all_pixels))
		data.append(all_pixels)
	for y in range(0,h - size + 1):
		for x in range(0, w - size + 1):
			total = 0
			pos = (y * w + x) * 4
			for i in range(0,len(data) - 1):
				key1 = ConcatImgData(pos,data[i],w,size) 
				for j in range(i+1,len(data)):
					key2 = ConcatImgData(pos,data[j],w,size) 
					diff = PixelMatch(key1,key2,size,size,0.1)
					total += diff
			if total >= highest:
				highest = total
				for k in range(0,amount - 1):
					keyhole[k] = keyhole[k+1]
				keyhole[amount-1] = [x,y]

	return keyhole
	#print ConcatImgData((keyhole[0][1] * w + keyhole[0][0]) * 4, data[0], w, size)				
	#print keyhole

def InsertTalent(hero, lvl, name, keys):
	entry = {'name': name,'keys': keys, 'description': '...'}
	print db.talents.update({'hero': hero,'level': lvl}, {'$push':{'talents': entry}})

def ConcatImgData(pos, data,width,size):
	pixels = []
	for y in range(0,size):
		pixels.extend(data[pos:pos+size*4])
	return pixels

def RedoLevel(hero, lvl, keyholes):
	talents = GetTalents(hero, lvl)
	for talent in talents:
		GetKeys(keyholes, lvl, keySize,talent, action='update')
	UpdateKeyholes(hero, lvl, keyholes)

def RedoAllTalents(hero):
	levels = [1,4,7,13,16,20]
	for lvl in levels:
		keyholes = GetKeyholes(hero, lvl)
		talents = GetTalents(hero, lvl)
		for talent in talents:
			GetKeys(keyholes, lvl, keySize, talent, action='update')

def AddHighlights(hero, lvl, name):
	desc = GetDesc(hero,lvl,name)
	words = desc.split(' ')
	newDesc = ""
	for word in words:
		if "class" not in word:
			match = re.search('\d', word)
			if match:
				if "(+" in word:
					word = "(+<span class='value'>"+word[2:]+"</span>"
				else:
					word = "<span class='value'>"+word+"</span>"
			if "Quest" in word or "Reward" in word:
				word = "<span class='quest'>"+word+"</span>"
		newDesc += word + " "
	UpdateDesc(hero,lvl,name,newDesc[:-1])

def GetKeyholes(hero,lvl):
	result = db.talents.find_one({'hero': hero, 'level': lvl})
	return result['keyholes']

def GetDesc(hero,lvl,name):
	result = db.talents.find_one({'hero': hero, 'level': lvl,'talents.name': name},{'talents.$':1})
	return result['talents'][0]['description']

def UpdateDesc(hero,lvl,name,desc):
	print db.talents.update({'hero': hero,'level': lvl,'talents.name':name}, {'$set':{'talents.$.description':desc}})

def UpdateKeys(hero,lvl,name,keys):
	print db.talents.update({'hero': hero,'level': lvl,'talents.name':name}, {'$set':{'talents.$.keys':keys}})

def UpdateKeyholes(hero, lvl, keyholes):
	print db.talents.update({'hero': hero,'level': lvl},{'$set':{'keyholes':keyholes}})

def GetImgData(f):
	reader = png.Reader(filename=f).asRGBA()
	return reader
def GetKeys(keyholes, lvl, size, f, action='none'):
	keys = []
	pixel_byte_width = 4
	w, h, all_pixels, metadata = GetImgData('talents/'+hero+'/'+str(lvl)+'/'+f)
	all_pixels = list(itertools.chain(*all_pixels))
	for keyhole in keyholes:
		pixels = []
		for y in range (0,size):
			pixel_position = keyhole[0] + keyhole[1] * w + w*y
			pixels.extend(all_pixels[pixel_position * pixel_byte_width : (pixel_position + size) * pixel_byte_width])
		keys.append(pixels)
	name = ""
	words = re.findall('[A-Z][^A-Z]*',f[:-4])
	for word in words:
		name += word + " "
	if action == 'update':
		UpdateKeys(hero,lvl,name[:-1], keys)
	if action == 'insert':
		InsertTalent(hero, lvl, name[:-1], keys)
	#print (keys)

def GetTalents(hero, lvl):
	directory = './talents/'+hero+'/'+str(lvl)+'/'
	talents = []
	for root, dirs, files in os.walk(directory):
		names = ""
		for file in files:
			if file.endswith('.png'):
				talents.append(file)
				#GetKeys(keyholes,keySize,file)
	return talents
	#if update:
		#UpdateKeyholes(hero, lvl, keyholes)

def GetAllHeroes():
	with open("names.txt") as f:
		return f.readline().split(' ')	

#print GetDesc("Abathur", 10, "Evolve Monstrosity")
#GetKeys(GetKeyholes("Abathur",10),'heroic',2,)

#InsertTalent("Abathur", 10, "test", [0,0])
#RedoAllTalents(hero)
hero = "Brightwing"
#keyholes = DiscoverKeyholes(hero,"heroic", 2, 2)
#UpdateKeyholes(hero, 10, keyholes)
keyholes = [[1,6],[0,6]]

RedoLevel(hero, 16, keyholes)

#RedoAllTalents(hero)

#RedoLevel(hero,13, GetKeyholes(hero,13))

#GetKeyholes(hero, level)
#GetAllKeys()