import {useState} from 'react';
import {type DocumentActionComponent, type FieldProps, useDocumentOperation, useFormValue} from 'sanity';
import {suggestMissingDetails} from './suggestions';

export function AssumptionField(props: FieldProps) {
  const fields = useFormValue(['assumedFields']);
  const assumed = Array.isArray(fields) && fields.includes(props.name);
  return <div>{assumed && <p style={{color:'#a26b00',fontWeight:600}}>Suggested assumption — review this field, then remove its name from “Assumptions awaiting review”.</p>}{props.renderDefault(props)}</div>;
}
export const SuggestDetails: DocumentActionComponent = props => {
  const [open,setOpen] = useState(false);
  const {patch} = useDocumentOperation(props.id,props.type);
  const document = (props.draft || props.published || {}) as Record<string,unknown>;
  const suggestions = suggestMissingDetails(document);
  const names = Object.keys(suggestions);
  return {
    label:'Suggest missing details', disabled:Boolean(patch.disabled), onHandle:()=>setOpen(true),
    dialog:open ? {type:'dialog',header:'Review suggested assumptions',onClose:()=>{setOpen(false);props.onComplete()},content:<div style={{padding:24}}>
      <p>Suggestions use only your written project brief. Images and videos are not analysed. Existing fields, dates and credits are never invented or replaced.</p>
      {names.length ? <><p>These suggestions remain in the draft until you review and publish it.</p>{names.map(name=><div key={name} style={{marginBottom:16}}><strong>{name} — assumed</strong><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(suggestions[name],null,2)}</pre></div>)}<button onClick={()=>{patch.execute([{set:{...suggestions,assumedFields:[...new Set([...(Array.isArray(document.assumedFields)?document.assumedFields:[]),...names])]}}]);setOpen(false);props.onComplete()}}>Apply these suggestions to draft</button></> : <p>Add a project brief first. Suggestions fill only missing fields.</p>}
    </div>} : undefined,
  };
};
