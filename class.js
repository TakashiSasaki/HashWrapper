//class HashWrapper
function HashWrapper(storage, maxValueLength){
  if(storage === undefined) {
    this.storage = new Sskv();
  } else {
    this.storage = storage;
  }
  
  if(maxValueLength === undefined) {
    this.maxValueLength = 10;
  } else {
    this.maxValueLength = maxValueLength;
  }
  
  this.appendArray = appendArray_;
  this.getArray = getArray_;
  this.putArray = putArray_;
  this.getJson = getJson_;
  this.putJson = putJson_;
  this.putObject = putObject_;
  this.getObject = getObject_;
  this.putString = putString_;
  this.getString = getString_;

  this.put = function(key, any) {
    assert(typeof key === "string");
    assert(any !== undefined);
    if(typeof any === "string") {
      this.putString(key, any);
    } else if(any === null || typeof any === "boolean" || typeof any === "number") {
      this.putJson(key,any);
    } else if(any instanceof Array) {
      this.putArray(key, any);
    } else if(any instanceof Object) {
      this.putObject(key, any);
    } else {
      throw "HashWrapper#put: unexpected type of value. " + typeof any;
    }
  };//put
  
  this.fetch = function(){
    var keysToRead = [];
    for(var k in this.readBuffer){
      if(this.readBuffer[k] === undefined) {
        keysToRead.push(k);
        delete this.readBuffer[k];
      }
    }//for
    if(keysToRead.length > 0) {
      this.getAllCount += 1;
      var x = this.storage.getAll(keysToRead);
      assert(x instanceof Object);
      for(var l in x) {
        this.readBuffer[l] = x[l];
      }//for l
    }//if
  };//fetch

  this.commit = function(key){
    var keysToRemove = [];
    for(var i in this.writeBuffer){
      if(this.writeBuffer[i] === undefined) {
        keysToRemove.push(i);
        delete this.writeBuffer[i];
        delete this.readBuffer[i];
      }
    }// for i
    if(keysToRemove.length > 0) {
      this.removeAllCount += 1;
      this.storage.removeAll(keysToRemove);
    }
    
    if(typeof key === "string") {
      assert(this.writeBuffer[H(key)] === undefined);
      const writeBufferKeys = Object.keys(this.writeBuffer);
      assert(writeBufferKeys instanceof Array);
      if(writeBufferKeys.length > 0) {
        this.writeBuffer[H(key)] = JSON.stringify(writeBufferKeys);
        this.putAllCount += 1;
        this.storage.putAll(this.writeBuffer);
        for(var j in this.writeBuffer){
          this.readBuffer[j] = this.writeBuffer[j];
        }// for j
      }
    }//if
  };//commit

  this.get = function(key) {
    assert(typeof key === "string");
    if(//this.readBuffer[key]    === undefined && 
       this.readBuffer[S(key)] === undefined &&
       this.readBuffer[L(key)] === undefined &&
       this.readBuffer[O(key)] === undefined &&
       this.readBuffer[J(key)] === undefined) 
    {
       this.readBuffer[key]      = undefined;
       this.readBuffer[H(key)]   = undefined;
       this.readBuffer[S(key)]   = undefined; 
       this.readBuffer[S(key,0)] = undefined;
       this.readBuffer[S(key,1)] = undefined;
       this.readBuffer[S(key,2)] = undefined;
       this.readBuffer[S(key,3)] = undefined;
       this.readBuffer[S(key,4)] = undefined;
       this.readBuffer[L(key)]   = undefined;
       this.readBuffer[L(key,0)] = undefined;
       this.readBuffer[L(key,1)] = undefined;
       this.readBuffer[L(key,2)] = undefined;
       this.readBuffer[L(key,3)] = undefined;
       this.readBuffer[L(key,4)] = undefined;
       this.readBuffer[O(key)]   = undefined;
       this.readBuffer[J(key)]   = undefined;
       this.fetch();
    }//if

    if(typeof this.readBuffer[H(key)] === "string") {
      var parsed = JSON.parse(this.readBuffer[H(key)]);
      for(var i in parsed) {
        if(this.readBuffer[parsed[i]] === undefined) {
          this.readBuffer[parsed[i]] = undefined;
        }
      }//for i
      this.fetch();
    }
    
    if(typeof this.readBuffer[S(key)] === "string") {
      return this.getString(key);
    } else if(typeof this.readBuffer[J(key)] === "string") {
      return this.getJson(key);
    } else if(typeof this.readBuffer[L(key)] === "string") {
      return this.getArray(key);
    } else if(typeof this.readBuffer[O(key)] === "string") {
      return this.getObject(key);
    } else {
      throw "HashWrapper#get: key " + key + " not found in readBuffer.";
    }
  }//get

  this.remove = function(keys){
    for(var i in keys) {
      assert(typeof keys[i] === "string");
      this.writeBuffer[S(keys[i])] = undefined;
      this.writeBuffer[J(keys[i])] = undefined;
      this.writeBuffer[L(keys[i])] = undefined;
      this.writeBuffer[O(keys[i])] = undefined;
      this.writeBuffer[H(keys[i])] = undefined;
      delete this.readBuffer[S(keys[i])];
      delete this.readBuffer[J(keys[i])];
      delete this.readBuffer[L(keys[i])];
      delete this.readBuffer[O(keys[i])];
      delete this.readBuffer[H(keys[i])];
    }//for i
  };

  this.write = function(key, value){
    assert(typeof key === "string");
    assert(value !== undefined);
    this.writeBuffer[key] = value;
    this.readBuffer[key] = value;
  };//write
  
  this.read = function(key) {
    assert(typeof key === "string");
    if(this.readBuffer[key] === undefined) {
      this.getCount += 1;
      this.readBuffer[key] = this.storage.get(key);
      if(this.readBuffer[key] === null) this.readBuffer[key] = undefined;
    }
    return this.readBuffer[key];
  };//read
  
  this.reset = function(){
    this.writeBuffer = {};
    this.readBuffer = {};
    this.getAllCount = 0;
    this.putAllCount = 0;
    this.removeAllCount = 0;
    this.getCount = 0;
  };
  
  this.roundtripTest = function(key,value){
    this.reset();
    this.put(key, value);
    this.commit(key);
    assert(this.putAllCount === 1);
    assert(this.removeAllCount === 0);
    assert(this.getAllCount === 0);
    assert(this.getCount === 0);
    this.reset();
    assert.deepStrictEqual(this.get(key), value);
    assert(this.putAllCount === 0);
    assert(this.removeAllCount === 0);
    assert(this.getAllCount <= 2);
    assert(this.getCount === 0);
  };
  
  this.reset();
  return this;
}//HashWrapper

function H(key) {  // generate hint-key
  assert(typeof key === "string");
  return "#" + key + "#";
}

function S(key, i) {  // generate string-key
  assert(typeof key === "string");
  assert(i === undefined || typeof i === "number");
  if(i === undefined) return "$" + key + "$";
  return "$" + key + "$" + i;
}

function L(key, i){
  assert(typeof key === "string");
  assert(i === undefined || typeof i === "number");
  if(i === undefined) return "[" + key + "]";
  return "[" + key + "]" + i;
}

function O(key, i){
  assert(typeof key === "string");
  assert(i === undefined || typeof i === "string");
  if(i === undefined) return "{" + key + "}";
  return "{" + key + "}" + i;
}

function J(key){
  assert(typeof key === "string");
  return "(" + key + ")";
}