!function(){"use strict";function e(e){WScript.StdOut.Write(encodeURI(JSON.stringify(e)))}function t(e){var t=[],n=e.Fields,r=n.Count;if(!e.BOF||!e.EOF){var o,u,i,f;for(e.MoveFirst();!e.EOF;){for(u={},o=0;o<r;o++)"date"==typeof(f=(i=n.Item(o)).Value)&&(f=String(f)),u[i.Name]=f;t.push(u),e.MoveNext()}}return t}function n(e){for(var t={},n=e.Properties,r=n.Count,o=0;o<r;o++)prop=n.Item(o),t[prop.Name]={Type:prop.Type,Value:prop.Value};return t}function r(e){var t={};if(!e.BOF||!e.EOF)for(var r,o=e.Fields,u=o.Count,i=0;i<u;i++)t[(r=o.Item(i)).Name]={Attributes:r.Attributes,DefinedSize:r.DefinedSize,NumericScale:r.NumericScale,Precision:r.Precision,Type:r.Type,Properties:n(r)};return t}function o(e){e.State&&e.Close()}"object"!=typeof JSON&&(JSON={}),function(){function e(e){return e<10?"0"+e:e}function t(){return this.valueOf()}function n(e){return c.lastIndex=0,c.test(e)?'"'+e.replace(c,function(e){var t=l[e];return"string"==typeof t?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}function r(e,t){var o,u,i,f,c,a=s,l=t[e];switch(l&&"object"==typeof l&&"function"==typeof l.toJSON&&(l=l.toJSON(e)),"function"==typeof y&&(l=y.call(t,e,l)),typeof l){case"string":return n(l);case"number":return isFinite(l)?String(l):"null";case"boolean":case"null":return String(l);case"object":if(!l)return"null";if(s+=p,c=[],"[object Array]"===Object.prototype.toString.apply(l)){for(f=l.length,o=0;o<f;o+=1)c[o]=r(o,l)||"null";return i=0===c.length?"[]":s?"[\n"+s+c.join(",\n"+s)+"\n"+a+"]":"["+c.join(",")+"]",s=a,i}if(y&&"object"==typeof y)for(f=y.length,o=0;o<f;o+=1)"string"==typeof y[o]&&(i=r(u=y[o],l))&&c.push(n(u)+(s?": ":":")+i);else for(u in l)Object.prototype.hasOwnProperty.call(l,u)&&(i=r(u,l))&&c.push(n(u)+(s?": ":":")+i);return i=0===c.length?"{}":s?"{\n"+s+c.join(",\n"+s)+"\n"+a+"}":"{"+c.join(",")+"}",s=a,i}}var o=/^[\],:{}\s]*$/,u=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,i=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,f=/(?:^|:|,)(?:\s*\[)+/g,c=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,a=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+e(this.getUTCMonth()+1)+"-"+e(this.getUTCDate())+"T"+e(this.getUTCHours())+":"+e(this.getUTCMinutes())+":"+e(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=t,Number.prototype.toJSON=t,String.prototype.toJSON=t);var s,p,l,y;"function"!=typeof JSON.stringify&&(l={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(e,t,n){var o;if(s="",p="","number"==typeof n)for(o=0;o<n;o+=1)p+=" ";else"string"==typeof n&&(p=n);if(y=t,t&&"function"!=typeof t&&("object"!=typeof t||"number"!=typeof t.length))throw new Error("JSON.stringify");return r("",{"":e})}),"function"!=typeof JSON.parse&&(JSON.parse=function(e,t){function n(e,r){var o,u,i=e[r];if(i&&"object"==typeof i)for(o in i)Object.prototype.hasOwnProperty.call(i,o)&&((u=n(i,o))!==undefined?i[o]=u:delete i[o]);return t.call(e,r,i)}var r;if(e=String(e),a.lastIndex=0,a.test(e)&&(e=e.replace(a,function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})),o.test(e.replace(u,"@").replace(i,"]").replace(f,"")))return r=eval("("+e+")"),"function"==typeof t?n({"":r},""):r;throw new SyntaxError("JSON.parse")})}();var u={execute:function(n){var r,u={valid:!0},i=!!n.scalar,f=new ActiveXObject("ADODB.Connection");i&&(r=new ActiveXObject("ADODB.Recordset")),f.CursorLocation=3;try{f.Open(n.connection),f.Execute(n.sql),i&&(r.Open(n.scalar,f,0,1),u.records=t(r))}catch(c){u.valid=!1,u.message=c.message}e(u),o(f),i&&o(r)},query:function(n){var u=!!n.schema,i=new ActiveXObject("ADODB.Connection"),f=new ActiveXObject("ADODB.Recordset"),c={valid:!0};i.CursorLocation=3;try{i.Open(n.connection),f.Open(n.sql,i,0,1),c.records=t(f),u&&(c.schema=r(f))}catch(a){c.valid=!1,c.message=a.message}e(c),o(f),o(i)}};try{u[WScript.Arguments(0)](JSON.parse(decodeURI(WScript.Arguments(1))))}catch(i){e({valid:!1,message:i.message})}}();