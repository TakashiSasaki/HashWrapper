/**
  @param {string} key
  @param {Array} array
  @return {object}
*/
function putArray(key, array) {
  if(typeof key !== "string") throw "putArray: expects string key.";
  if(!(array instanceof Array)) throw "putArray: expects array";
  var all = {"TO BE REMOVED": getDerivedKeys(key)};
  all["[" + key + "]"] = "" + array.length;
  for(var i=0; i<array.length; ++i) {
    merge(all, putAny("[" + key + "]" + i, array[i]));
  }//for
  return all;
}//putArray

/**
 * @param {stirng} key
 * @param {object} values, optional
 * @return {object}
 */
function getArray(key, values){
  if(typeof key !== "string") throw "getArray: expects string key.";
  if(values === undefined) {values = {};}
  if(values["[" + key + "]"] === undefined) {
    values["[" + key + "]"] = cache.get("[" + key + "]");
    if(values["[" + key + "]"] === null) throw "getArray: [" + key + "] not found";
  }
  var length = parseInt(values["[" + key + "]"]);
  var result = [];
  for(var i=0; i < length; ++i) {
    result.push(getAny("[" + key + "]" + i, values));
  }
  return result;
}//getArray

function appendArray(key, array) {
  if(typeof key !== "string") throw "appendArray: expects string key";
  if(!(array instanceof Array)) throw "appendArray: expects array value";
  var l = cache.get("[" + key + "]");
  if(l === null) throw "appendArray: key [" + key + "] not found";
  cache.put("[" + key + "]", parseInt(l) + array.length);
  for(var i=0; i<array.length; ++i) {
    putAny("[" + key + "]" + parseInt(l) + i, array[i]);
  }//for
}//appendArray

function merge(o1, o2){
  var remove1 = o1["TO BE REMOVED"];
  var remove2 = o2["TO BE REMOVED"];
  if(remove1 === undefined) remove1 = [];
  if(remove2 === undefined) remove2 = [];
  Array.prototype.push.apply(remove1, remove2);
  for(var i in o2) {
    o1[i] = o2[i];
  }
  o1["TO BE REMOVED"] = remove1;
  return o1;
}

function testArray(){
  var a = [1, 2, 3, "a", "b", "c"];
  removeAndPut(putArray("k", a));
  var got = getArray("k");
  Logger.log(got);
  if(JSON.stringify(a) !== JSON.stringify(got)) throw "testArray: a != got.";
}

if(exports === undefined) exports = {};
exports.merge = merge;

