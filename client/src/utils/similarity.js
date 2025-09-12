// client/src/utils/similarity.js
export function euclidean(a,b){
  const keys = ['R','I','A','S','E','C'];
  return Math.sqrt(keys.reduce((acc,k) => acc + Math.pow((a[k]||0)-(b[k]||0),2), 0));
}

export function cosine(a,b){
  const keys = ['R','I','A','S','E','C'];
  const dot = keys.reduce((s,k)=> s + (a[k]||0)*(b[k]||0), 0);
  const normA = Math.sqrt(keys.reduce((s,k)=> s + Math.pow((a[k]||0),2), 0));
  const normB = Math.sqrt(keys.reduce((s,k)=> s + Math.pow((b[k]||0),2), 0));
  return normA && normB ? dot / (normA*normB) : 0;
}
