function Sskv(){
  this.o = {};
  
  this.getAll = function(keys){
    assert(keys instanceof Array);
    var all = {};
    for(var i in keys) {
      assert(typeof keys[i] === "string");
      all[keys[i]] = this.o[keys[i]];
      if(all[i] === undefined) all[i] = null;
      assert(all[i] === null || typeof all[i] === "string");
    }//for
    return all;
  }//getAll
  
  this.get = function(key){
    assert(typeof key === "string");
    var v = this.o[key];
    if(v === null) v = undefined;
    assert(typeof v === "string");
    return v;
  }//get
  
  this.putAll = function(object){
    assert(object !== null && typeof object === "object");
    for(var i in object){
      this.o[i] = object[i];
      assert(typeof this.o[i] === "string");
    }//for
  }//putAll
  
  this.removeAll = function(keys){
    assert(keys instanceof Array);
    for(var i in keys) {
      var key = keys[i];
      assert(typeof key === "string");
      delete o[key];
    }//for i
  }//removeAll
}