import {useEffect,useState} from 'react';
import {type PreviewProps,useClient} from 'sanity';
export function ProjectListPreview(props:PreviewProps & {projectId?:string;orderRank?:string}) {
 const client=useClient({apiVersion:'2025-02-19'});
 const [position,setPosition]=useState<number>();
 useEffect(()=>{
  let active=true;let timer:ReturnType<typeof setTimeout>;
  const load=()=>client.fetch<string[]>('*[_type=="project"] | order(orderRank asc,sortOrder asc,title asc,_id asc)._id',{},{perspective:'raw'}).then(rows=>{if(!active)return;const ids=[...new Set(rows.map(x=>x.replace(/^drafts\./,'')))];const index=ids.indexOf((props.projectId||'').replace(/^drafts\./,''));setPosition(index<0?undefined:index+1)}).catch(()=>{});
  void load();
  const subscription=client.listen('*[_type=="project"]',{}, {includeResult:false}).subscribe({next:()=>{clearTimeout(timer);timer=setTimeout(()=>void load(),150)},error:()=>{}});
  return()=>{active=false;clearTimeout(timer);subscription.unsubscribe()};
 },[client,props.projectId,props.orderRank]);
 return props.renderDefault({...props,title:`${position ? String(position).padStart(2,'0')+' / ' : ''}${props.title||'Untitled project'}`});
}
