import csv, json, re, os, collections, sys
B='/tmp/claude-0/build'; S='/tmp/claude-0/src'
# Dizionario it -> [en]
it2en=collections.OrderedDict()
for line in open(f'{B}/dizionario.txt', encoding='utf-8'):
    line=line.strip()
    if not line or line.startswith('#'): continue
    it, en = line.split('=',1)
    lst=it2en.setdefault(it.strip().lower(), [])
    for e in en.split('|'):
        e=e.strip()
        if e and e not in lst: lst.append(e)
en2it=collections.defaultdict(list)
for it, ens in it2en.items():
    for e in ens:
        k=e.lower()
        if it not in en2it[k]: en2it[k].append(it)
json.dump(it2en, open(f'{B}/it-en.json','w',encoding='utf-8'), ensure_ascii=False, separators=(',',':'))
print('dizionario', len(it2en))

def norm(s): return re.sub(r'\s+',' ', s.lower().replace('_',' ').replace('-',' ')).strip()

# Mulberry
rows=list(csv.DictReader(open(f'{S}/mulberry-symbols/scripts/data/symbol-info.csv', encoding='utf-8')))
skipcat={'Country Flags','Country Maps'}
mb=[]; per=collections.Counter()
for r in rows:
    if r['rated']!='0' or r['category-en'] in skipcat: continue
    name=r['symbol-en']
    b=re.sub(r'_,_to$','',name)
    b=re.sub(r'_\d+[a-z]?(?=_|$)','',b)
    base=norm(b)
    if base not in en2it:
        parts=base.split(' ')
        if len(parts)>1 and parts[-1] in ('lady','man','woman','boy','girl','parent','male','female','child'):
            base=' '.join(parts[:-1])
    if base not in en2it: continue
    if per[base]>=2: continue
    if not os.path.exists(f'{S}/mulberry-symbols/EN/{name}.svg'): continue
    per[base]+=1
    mb.append({'id':name,'en':[base],'it':en2it[base]})
print('mulberry', len(mb))

# OpenMoji
om_all=json.load(open(f'{S}/openmoji/data/openmoji.json', encoding='utf-8'))
om=[]; per=collections.Counter(); seen=set()
def add(x, keys):
    keys=[k for k in keys if k in en2it]
    if not keys or x['hexcode'] in seen: return
    key=keys[0]
    if per[key]>=3: return
    per[key]+=1; seen.add(x['hexcode'])
    its=[]
    for k in keys:
        for i in en2it[k]:
            if i not in its: its.append(i)
    om.append({'id':x['hexcode'],'en':keys,'it':its})
cands=[x for x in om_all if not x['skintone'] and x['group'] not in ('flags','component','extras-unicode')
       and x['subgroups'] not in ('brand','ui-element','flags')]
ADJ={'red','green','yellow','blue','orange','purple','brown','black','white','grey','gray','pink','light','small','large','big'}
def ann_keys(a):
    a=norm(a); out=[a]
    w=a.split(' ')
    while len(w)>1 and w[0] in ADJ:
        w=w[1:]; out.append(' '.join(w))
    return out
for x in cands: add(x, ann_keys(x['annotation']))
for x in cands:
    ot=[norm(t) for t in x.get('openmoji_tags','').split(',') if t.strip()]
    tags=[norm(t) for t in x.get('tags','').split(',') if t.strip()] if x['group']=='smileys-emotion' else []
    add(x, ot+tags)
print('openmoji', len(om))
json.dump({'mulberry':mb,'openmoji':om}, open(f'{B}/selection.json','w'), ensure_ascii=False)
missing=[e for e in en2it if e not in {m['en'][0] for m in mb}]
print('esempi it senza mulberry:', missing[:40])
