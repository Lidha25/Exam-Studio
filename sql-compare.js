/* Shared deterministic result comparison. Column aliases are intentionally ignored. */
(function(root){
 const equalCell=(a,b)=>typeof a==='number'&&typeof b==='number'?Math.abs(a-b)<=1e-6:typeof a===typeof b&&a===b;
 const equalRow=(a,b)=>a.length===b.length&&a.every((v,i)=>equalCell(v,b[i]));
 function compare(actual,expected,ordered){
  const expectedWidth=expected.columns.length;
  if(actual.columns.length!==expectedWidth)return {ok:false,kind:'columns',message:`Your query returns ${actual.columns.length} column(s); this task needs ${expectedWidth}. Check the requested fields and aggregates.`};
  if(actual.values.length!==expected.values.length)return {ok:false,kind:'rows',message:`Your query returns ${actual.values.length} row(s); the reference returns ${expected.values.length}. Check filters, joins, grouping, DISTINCT and LIMIT.`};
  const remaining=actual.values.slice();
  const same=ordered?actual.values.every((row,i)=>equalRow(row,expected.values[i])):expected.values.every(row=>{const i=remaining.findIndex(r=>equalRow(r,row));if(i<0)return false;remaining.splice(i,1);return true});
  if(same)return {ok:true,kind:'match',message:'Your query output matches the reference output on the supplied Chinook database. Explain your method below: a matching result alone does not prove the method works for every dataset.'};
  if(ordered&&compare(actual,expected,false).ok)return {ok:false,kind:'order',message:'The rows and values match, but their order differs. Check ORDER BY, direction and the requested tie-break rule.'};
  let message='The output shape matches, but one or more values differ. Check the filter boundaries, NULL handling, SUM versus COUNT, and whether joins duplicate records.';
  if(actual.values.length===1&&expectedWidth===1)message=`Your result is ${String(actual.values[0][0])}; the verified result is ${String(expected.values[0][0])}. Check the population, filter boundaries and aggregation.`;
  return {ok:false,kind:'values',message};
 }
 root.SQLResultCompare={compare};
 if(typeof module!=='undefined')module.exports=root.SQLResultCompare;
})(typeof self!=='undefined'?self:globalThis);
