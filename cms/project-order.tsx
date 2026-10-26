import {useCallback, useEffect, useState} from 'react';
import {useClient} from 'sanity';
import {useRouter} from 'sanity/router';

type Row = {_id:string; _rev:string; title?:string; sortOrder?:number; status?:string};
const baseId = (id:string) => id.replace(/^drafts\./, '');
export default function ProjectOrder() {
  const client = useClient({apiVersion:'2025-02-19'});
  const router = useRouter();
  const [documents,setDocuments] = useState<Row[]>([]), [ids,setIds] = useState<string[]>([]);
  const [message,setMessage] = useState('Loading projects…'), [busy,setBusy] = useState(false), [dirty,setDirty] = useState(false);
  const [dragged,setDragged] = useState<string|null>(null);
  const load = useCallback(async()=>{
    try {
      const docs = await client.fetch<Row[]>('*[_type == "project"] | order(sortOrder asc, title asc, _id asc){_id,_rev,title,sortOrder,status}',{}, {perspective:'raw'});
      setDocuments(docs); setIds([...new Set(docs.map(d=>baseId(d._id)))]); setDirty(false); setMessage('Drag a project or use the arrow buttons, then save the order.');
    } catch {setMessage('Could not load projects. Try Refresh.');}
  },[client]);
  useEffect(()=>{void load()},[load]);
  const move = (id:string, target:number) => {
    setIds(previous=>{const next=previous.filter(x=>x!==id);next.splice(Math.max(0,Math.min(target,next.length)),0,id);return next});setDirty(true);
  };
  const save = async()=>{
    setBusy(true);
    try {
      let tx=client.transaction();
      ids.forEach((id,i)=>documents.filter(d=>baseId(d._id)===id).forEach(d=>{tx=tx.patch(d._id,p=>p.ifRevisionId(d._rev).set({sortOrder:i+1}))}));
      await tx.commit(); await load();setMessage('Order saved. Published projects use this same order in every category. Website changes appear after the next deployment.');
    } catch {setMessage('Order was not saved. Another edit may have changed a project. Refresh and try again.');}
    finally {setBusy(false)}
  };
  return <section style={{maxWidth:900,margin:'0 auto',padding:32}}>
    <h1>Project priority</h1><p>Projects are numbered by position. The homepage uses the first five eligible projects for its hero and up to nine for its grid, in complete rows of three.</p>
    <p><strong>{ids.length} projects · Last position: {ids.length} · Next position: {ids.length+1}</strong></p>
    <p role="status">{message}</p>
    <div style={{display:'flex',gap:12,marginBottom:24}}><button disabled={busy||!dirty} onClick={save}>Save order</button><button disabled={busy} onClick={()=>void load()}>Refresh</button><button disabled={busy} onClick={()=>router.navigateIntent('create',{type:'project'})}>New project</button></div>
    <ol style={{listStyle:'none',padding:0}}>{ids.map((id,i)=>{
      const versions=documents.filter(d=>baseId(d._id)===id);const row=versions.find(d=>d._id.startsWith('drafts.'))||versions[0];
      return <li key={id} draggable={!busy} onDragStart={()=>setDragged(id)} onDragEnd={()=>setDragged(null)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragged&&dragged!==id)move(dragged,i);setDragged(null)}} style={{display:'flex',alignItems:'center',gap:12,padding:16,border:'1px solid #8885',borderRadius:6,marginBottom:8,opacity:dragged === id ? 0.5 : 1}}>
        <span aria-hidden="true">⠿</span><strong style={{minWidth:32}}>{String(i+1).padStart(2,'0')}</strong>
        <button style={{flex:1,textAlign:'left'}} disabled={busy} onClick={()=>router.navigateIntent('edit',{id,type:'project'})}>{row.title||'Untitled project'}</button>
        <small>{row.status==='published'?'Published':'Draft'}</small>
        <button disabled={busy||i===0} aria-label={`Move ${row.title||'project'} up`} onClick={()=>move(id,i-1)}>↑</button>
        <button disabled={busy||i===ids.length-1} aria-label={`Move ${row.title||'project'} down`} onClick={()=>move(id,i+1)}>↓</button>
      </li>
    })}</ol>
  </section>;
}
