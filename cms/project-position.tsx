import {useEffect,useState} from 'react';
import {type NumberInputProps,useClient,useFormValue} from 'sanity';
export function ProjectPosition(_props:NumberInputProps) {
  const client=useClient({apiVersion:'2025-02-19'});
  const id=String(useFormValue(['_id'])||'').replace(/^drafts\./,'');
  const [position,setPosition]=useState<number>(),[total,setTotal]=useState<number>();
  useEffect(()=>{let active=true;client.fetch<string[]>('*[_type=="project"] | order(orderRank asc,sortOrder asc,title asc,_id asc)._id',{},{perspective:'raw'}).then(rows=>{if(!active)return;const ids=[...new Set(rows.map(x=>x.replace(/^drafts\./,'')))];const index=ids.indexOf(id);setPosition(index<0?ids.length+1:index+1);setTotal(ids.length)}).catch(()=>{});return()=>{active=false}},[client,id]);
  return <div><strong>{position ? `Position ${position}`:'Loading position…'}</strong><p>{total !== undefined ? `Current list: ${total} projects. Last position: ${total}. A new project starts at ${total+1}.` : ''}</p><p>Change position by dragging in the Projects list. Numbers follow the list automatically.</p></div>;
}
