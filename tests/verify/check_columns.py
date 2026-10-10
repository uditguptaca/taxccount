"""Every column the code writes or reads must exist in the real schema (and every required column must be supplied).
Run from the repository root with PG* environment variables pointing at a database the app has installed."""
import re,subprocess,collections,sys
def q(sql): return subprocess.run(['psql','-tA','-c',sql],capture_output=True,text=True).stdout.strip()
cols=collections.defaultdict(set)
for l in q("select table_name||'|'||column_name from information_schema.columns where table_schema='public'").splitlines():
    if '|' in l:
        t,c=l.strip().split('|'); cols[t].add(c)
req=collections.defaultdict(set)
for l in q("select table_name||'|'||column_name from information_schema.columns where table_schema='public' and is_nullable='NO' and column_default is null and is_identity='NO'").splitlines():
    if '|' in l:
        t,c=l.strip().split('|'); req[t].add(c)
filled=set(q("select event_object_table from information_schema.triggers where trigger_name='trg_fill_org_id'").split())
files=subprocess.check_output("git ls-files 'src/**/*.ts' 'src/**/*.tsx' | grep -v '^src/db/'",shell=True,text=True).split()
lit=re.compile(r'`([^`]*)`|\'((?:[^\'\\\n]|\\.){20,})\'|"((?:[^"\\\n]|\\.){20,})"',re.S)
issues=[]; checked_ins=checked_upd=checked_alias=0
sqlish=re.compile(r'\b(SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b',re.I)
kw={'select','from','where','and','or','on','join','left','right','inner','outer','group','order','limit','as','set','values','case','when','then','else','end','not','null','in','is','like','having','union','distinct','by','using','returning','conflict','do','nothing','update','insert','into','delete','cross','lateral','with'}
for f in files:
    s=open(f,encoding='utf-8',errors='replace').read()
    for m in lit.finditer(s):
        text=next(g for g in m.groups() if g is not None)
        if not sqlish.search(text): continue
        line=s.count('\n',0,m.start())+1
        flat=re.sub(r'\$\{[^}]*\}','§',text)
        # INSERT INTO t (cols)
        for im in re.finditer(r'INSERT\s+INTO\s+([a-z_][a-z0-9_]*)\s*\(([^)]*)\)',flat,re.I):
            t=im.group(1).lower(); c=[x.strip().strip('"').lower() for x in im.group(2).split(',')]
            if '§' in im.group(2) or t not in cols: continue
            checked_ins+=1
            for r in sorted(req[t]-set(c)-({'org_id'} if t in filled else set())):
                issues.append((f,line,f'INSERT INTO {t}: required column "{r}" is not supplied'))
            for x in c:
                if x and x not in cols[t]: issues.append((f,line,f'INSERT INTO {t}: no column "{x}"'))
        # UPDATE t SET a=?, b=?
        for um in re.finditer(r'UPDATE\s+([a-z_][a-z0-9_]*)\s+SET\s+(.*?)(?:\bWHERE\b|\bRETURNING\b|$)',flat,re.I|re.S):
            t=um.group(1).lower()
            if t not in cols or '§' in um.group(2): continue
            body=re.sub(r'\([^()]*\)','()',um.group(2)); body=re.sub(r'\([^()]*\)','()',body)
            body=re.sub(r'\bCASE\b.*?\bEND\b','x',body,flags=re.I|re.S)
            checked_upd+=1
            for part in body.split(','):
                pm=re.match(r'\s*([a-z_][a-z0-9_]*)\s*=',part,re.I)
                if pm and pm.group(1).lower() not in cols[t]: issues.append((f,line,f'UPDATE {t}: no column "{pm.group(1).lower()}"'))
        # alias.column references
        alias={}
        for am in re.finditer(r'\b(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)(?:\s+(?:AS\s+)?([a-z_][a-z0-9_]*))?',flat,re.I):
            t=am.group(1).lower(); a=(am.group(2) or '').lower()
            if t in cols:
                alias[t]=t
                if a and a not in kw: alias[a]=t
        for rm in re.finditer(r'\b([a-z_][a-z0-9_]*)\.([a-z_][a-z0-9_]*)\b',flat,re.I):
            a,c=rm.group(1).lower(),rm.group(2).lower()
            if a in alias and c!='*':
                checked_alias+=1
                if c not in cols[alias[a]]: issues.append((f,line,f'{a}.{c}: table {alias[a]} has no column "{c}"'))
seen=set(); out=[]
for i in issues:
    if i not in seen: seen.add(i); out.append(i)
print(f'checked {checked_ins} INSERT lists, {checked_upd} UPDATE sets, {checked_alias} alias.column references')
print(f'column mismatches: {len(out)}')
TAIL_EXIT=1 if out else 0
for f,l,m in sorted(out): print(f'  {f}:{l}  {m}')
sys.exit(TAIL_EXIT)
