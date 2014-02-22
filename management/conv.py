import json

def main():
	info = {}
	with open('States.json') as st:
		data = json.loads(st.read())
		states = data['states']['state']
		for s in states:
			name = s['@attributes']['name']
			pop = s['@attributes']['population']
			print name, pop
			name = name.replace(' ', '')
			info[name] = int(pop)
	with open('pops.json', 'w') as out:
		out.write(json.dumps(info))

if __name__ == '__main__':
	main()